import { createUploadthing, type FileRouter } from "uploadthing/next";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PdfPageLoader } from "@/lib/pdf-loader";
import { getVectorStore } from "@/lib/vector-store";
import { CHUNK_OVERLAP, CHUNK_SIZE } from "@/config/ai";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getPlan, startOfQuotaPeriod } from "@/config/stripe";

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  // Enforce the plan's monthly upload quota before the upload starts.
  const plan = getPlan(subscriptionPlan.isSubscribed);
  const usedThisPeriod = await db.file.count({
    where: { userId: user.id, createdAt: { gte: startOfQuotaPeriod() } },
  });

  if (usedThisPeriod >= plan.quota) {
    throw new Error("Upload quota reached");
  }

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExist) return;

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      // The address UploadThing serves the file from. Used by the PDF viewer
      // in the browser and by the processing step below.
      url: file.url,
      uploadStatus: "PROCESSING",
    },
  });
  const markFile = (uploadStatus: "FAILED" | "SUCCESS") =>
    db.file.update({
      data: { uploadStatus },
      where: { id: createdFile.id },
    });

  try {
    const response = await fetch(file.url);

    if (!response.ok) {
      throw new Error(`Could not download the uploaded PDF: ${response.status}`);
    }

    const blob = await response.blob();

    // 1. Load: one LangChain Document per PDF page.
    const loader = new PdfPageLoader(blob);
    const pageDocs = await loader.load();

    // 2. Check the plan's page limit before spending anything on embeddings.
    const { isSubscribed } = metadata.subscriptionPlan;
    const plan = getPlan(isSubscribed);

    const isOverPageLimit = loader.totalPages > plan.pagesPerPdf;
    // A scanned PDF has no text layer, so there is nothing to search.
    const hasNoText = pageDocs.length === 0;

    if (isOverPageLimit || hasNoText) {
      await markFile("FAILED");
      return;
    }

    // 3. Split: cut each page into overlapping chunks. Smaller pieces make
    //    the search more precise, and the overlap keeps a sentence that
    //    straddles a boundary intact in at least one chunk. Each chunk keeps
    //    its page number.
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const chunks = await splitter.splitDocuments(pageDocs);

    // 4. Embed and store: every chunk becomes a vector saved next to its
    //    text in Postgres (see src/lib/vector-store.ts).
    await getVectorStore(createdFile.id).addDocuments(chunks);

    await markFile("SUCCESS");
  } catch (err) {
    console.error("PDF processing failed", err);
    await markFile("FAILED");
  }
};

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
