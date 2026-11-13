"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { usePlan } from "@/components/app-shell/plan-context";
import { useUploadThing } from "@/lib/uploadthing";

export type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; fileName: string; progress: number }
  | { phase: "opening"; fileName: string }
  | { phase: "error"; fileName?: string; message: string };

const isPdf = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

/**
 * Uploads one PDF and then opens it. Checks the plan's limits in the browser
 * first so the user gets a specific reason; the server enforces them again.
 */
export function usePdfUpload() {
  const plan = usePlan();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [state, setState] = useState<UploadState>({ phase: "idle" });

  const { data: usage } = trpc.getUploadUsage.useQuery();

  const { startUpload } = useUploadThing(
    plan.isSubscribed ? "proPlanUploader" : "freePlanUploader",
    {
      onUploadProgress: (progress) =>
        setState((current) =>
          current.phase === "uploading" ? { ...current, progress } : current
        ),
    }
  );

  // The server creates the file record when UploadThing calls it back, which
  // can be a moment after the upload ends. Retry until the record exists.
  const { mutate: openWhenReady } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      utils.getUserFiles.invalidate();
      utils.getUploadUsage.invalidate();
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  const start = useCallback(
    async (file: File) => {
      const fail = (message: string) =>
        setState({ phase: "error", fileName: file.name, message });

      if (!isPdf(file)) {
        return fail("Only PDF files can be uploaded.");
      }
      if (file.size > plan.maxFileSizeMb * 1024 * 1024) {
        return fail(
          `This file is larger than the ${plan.maxFileSizeMb} MB limit of the ${plan.name} plan.`
        );
      }
      if (usage && usage.used >= plan.quota) {
        return fail(
          `You have used all ${plan.quota} uploads for this month on the ${plan.name} plan.`
        );
      }

      setState({ phase: "uploading", fileName: file.name, progress: 0 });

      try {
        const result = await startUpload([file]);
        const key = result?.[0]?.key;
        if (!key) throw new Error("Upload returned no file");

        setState({ phase: "opening", fileName: file.name });
        openWhenReady({ key });
      } catch {
        fail("The upload didn't go through. Check your connection and try again.");
      }
    },
    [plan, usage, startUpload, openWhenReady]
  );

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return {
    state,
    start,
    reset,
    isBusy: state.phase === "uploading" || state.phase === "opening",
  };
}

export type PdfUpload = ReturnType<typeof usePdfUpload>;
