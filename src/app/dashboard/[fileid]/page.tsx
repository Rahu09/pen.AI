import FileWorkspace from "@/components/file/FileWorkspace";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  // Since Next 15, route params arrive as a promise.
  params: Promise<{
    fileid: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = await params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) notFound();

  return <FileWorkspace file={{ id: file.id, name: file.name, url: file.url }} />;
};

export default Page;
