"use client";

import { useDropzone } from "react-dropzone";
import { AlertCircle, FileText, Loader2, UploadCloud } from "lucide-react";
import { usePlan } from "@/components/app-shell/plan-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PdfUpload } from "./use-pdf-upload";

export function UploadDialog({
  open,
  onOpenChange,
  upload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upload: PdfUpload;
}) {
  const plan = usePlan();
  const { state, start, reset, isBusy } = upload;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    disabled: isBusy,
    onDrop: (accepted, rejected) => {
      const file = accepted[0] ?? rejected[0]?.file;
      if (file) start(file);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // an upload in progress cannot be dismissed by accident
        if (!next && isBusy) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a PDF</DialogTitle>
          <DialogDescription>
            Up to {plan.maxFileSizeMb} MB and {plan.pagesPerPdf} pages on the{" "}
            {plan.name} plan.
          </DialogDescription>
        </DialogHeader>

        {state.phase === "idle" || state.phase === "error" ? (
          <>
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring",
                isDragActive && "border-primary bg-accent/50"
              )}
            >
              <input {...getInputProps()} aria-label="Choose a PDF to upload" />
              <UploadCloud
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm">
                <span className="font-medium">Click to choose a file</span> or
                drag it here
              </p>
              <p className="text-xs text-muted-foreground">PDF only</p>
            </div>

            {state.phase === "error" ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {state.fileName ? (
                    <span className="block font-medium">{state.fileName}</span>
                  ) : null}
                  {state.message}
                </span>
              </p>
            ) : null}
          </>
        ) : (
          <div className="space-y-3 rounded-lg border p-4" aria-live="polite">
            <div className="flex items-center gap-3">
              <FileText
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {state.fileName}
              </span>
            </div>
            <Progress
              value={state.phase === "opening" ? 100 : state.progress}
              className="h-1.5"
              aria-label="Upload progress"
            />
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              {state.phase === "opening"
                ? "Uploaded. Opening your file…"
                : `Uploading… ${Math.round(state.progress)}%`}
            </p>
          </div>
        )}

        {state.phase === "error" ? (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
