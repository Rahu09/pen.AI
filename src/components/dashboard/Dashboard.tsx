"use client";

import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useLocalStorage } from "@mantine/hooks";
import { Upload } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { usePlan } from "@/components/app-shell/plan-context";
import { PageWash } from "@/components/app-shell/PageWash";
import { UsageCard } from "@/components/app-shell/UsageCard";
import { Button } from "@/components/ui/button";
import { FileCard, FileRow } from "./FileCard";
import { DeleteFileDialog, RenameFileDialog } from "./FileDialogs";
import {
  DropOverlay,
  EmptyFiles,
  FilesError,
  FilesSkeleton,
  NoMatches,
} from "./FilesStates";
import { FilesToolbar } from "./FilesToolbar";
import { UploadDialog } from "./UploadDialog";
import { sortFiles, type SortKey, type UserFile, type ViewMode } from "./types";
import { useFileActions } from "./use-file-actions";
import { usePdfUpload } from "./use-pdf-upload";

const isProcessing = (file: UserFile) =>
  file.uploadStatus === "PROCESSING" || file.uploadStatus === "PENDING";

export default function Dashboard() {
  const plan = usePlan();

  const {
    data: files,
    isLoading,
    isError,
    refetch,
  } = trpc.getUserFiles.useQuery(undefined, {
    // keep checking while a file is being processed, so its badge clears
    refetchInterval: (data) => (data?.some(isProcessing) ? 2000 : false),
  });

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [storedView, setView] = useLocalStorage<ViewMode>({
    key: "penai:files-view",
    defaultValue: "grid",
  });
  const view = storedView ?? "grid";

  const [renaming, setRenaming] = useState<UserFile | null>(null);
  const [deleting, setDeleting] = useState<UserFile | null>(null);
  const { rename, remove } = useFileActions();

  const upload = usePdfUpload();
  const [uploadOpen, setUploadOpen] = useState(false);

  // Dropping a PDF anywhere on the page starts an upload. Clicks and keyboard
  // are left alone: the Upload button is the way in for those.
  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    disabled: upload.isBusy,
    onDrop: (accepted, rejected) => {
      const file = accepted[0] ?? rejected[0]?.file;
      if (!file) return;
      setUploadOpen(true);
      upload.start(file);
    },
  });

  const visibleFiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = (files ?? []).filter((file) =>
      file.name.toLowerCase().includes(needle)
    );
    return sortFiles(matching, sort);
  }, [files, query, sort]);

  const itemProps = { onRename: setRenaming, onDelete: setDeleting };
  const hasFiles = (files?.length ?? 0) > 0;

  return (
    <div {...getRootProps()} className="relative isolate min-h-full outline-none">
      <PageWash />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
              My <em>files</em>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasFiles
                ? `${files!.length} ${files!.length === 1 ? "PDF" : "PDFs"}`
                : "Your PDFs will appear here"}
              {" · "}
              up to {plan.pagesPerPdf} pages and {plan.maxFileSizeMb} MB each
            </p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="gap-2 rounded-full bg-foreground px-5 text-background hover:bg-foreground/85"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload PDF
          </Button>
        </header>

        {/* The sidebar shows usage on wide screens; below that it goes here. */}
        <UsageCard className="lg:hidden" />

        {isLoading ? (
          <FilesSkeleton view={view} />
        ) : isError ? (
          <FilesError onRetry={() => refetch()} />
        ) : !hasFiles ? (
          <EmptyFiles onUpload={() => setUploadOpen(true)} />
        ) : (
          <>
            <FilesToolbar
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
            />

            {visibleFiles.length === 0 ? (
              <NoMatches query={query.trim()} onClear={() => setQuery("")} />
            ) : view === "grid" ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleFiles.map((file) => (
                  <FileCard key={file.id} file={file} {...itemProps} />
                ))}
              </ul>
            ) : (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-paper">
                {visibleFiles.map((file) => (
                  <FileRow key={file.id} file={file} {...itemProps} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {isDragActive ? <DropOverlay /> : null}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        upload={upload}
      />
      <RenameFileDialog
        file={renaming}
        onClose={() => setRenaming(null)}
        onRename={(id, name) => rename.mutate({ id, name })}
      />
      <DeleteFileDialog
        file={deleting}
        isDeleting={remove.isLoading}
        onClose={() => setDeleting(null)}
        onDelete={(id) => remove.mutate({ id })}
      />
    </div>
  );
}
