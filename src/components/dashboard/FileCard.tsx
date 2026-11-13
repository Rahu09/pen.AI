"use client";

import Link from "next/link";
import { FileActionsMenu } from "./FileActionsMenu";
import { MessageCount, UploadedAt } from "./FileMeta";
import { FileStatusBadge } from "./FileStatusBadge";
import { PdfThumbnail } from "./PdfThumbnail";
import type { UserFile } from "./types";

type FileItemProps = {
  file: UserFile;
  onRename: (file: UserFile) => void;
  onDelete: (file: UserFile) => void;
};

/** A file in the grid view: first-page preview on top, details below. */
export function FileCard({ file, onRename, onDelete }: FileItemProps) {
  const href = `/dashboard/${file.id}`;

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-paper transition duration-200 focus-within:ring-2 focus-within:ring-ring hover:-translate-y-0.5 hover:shadow-paper-lifted motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* The preview is a second way to open the file. The name below is the
          real link, so this one is hidden from keyboard and screen readers. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[16/10] overflow-hidden border-b"
      >
        <PdfThumbnail url={file.url} enabled={file.uploadStatus === "SUCCESS"} />
        <span className="absolute left-2 top-2">
          <FileStatusBadge status={file.uploadStatus} failureReason={file.failureReason} />
        </span>
      </Link>

      <div className="flex items-start gap-1 p-3">
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            title={file.name}
            className="block truncate rounded-sm text-sm font-medium outline-none focus-visible:underline"
          >
            {file.name}
          </Link>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <UploadedAt date={file.createdAt} />
            <MessageCount count={file._count.messages} />
          </p>
        </div>
        <FileActionsMenu file={file} onRename={onRename} onDelete={onDelete} />
      </div>
    </li>
  );
}

/** A file in the list view: one row, no preview. */
export function FileRow({ file, onRename, onDelete }: FileItemProps) {
  return (
    <li className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent/40">
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/${file.id}`}
          title={file.name}
          className="block truncate rounded-sm text-sm font-medium outline-none focus-visible:underline"
        >
          {file.name}
        </Link>
        {/* On narrow screens the date and count move under the name. */}
        <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
          <UploadedAt date={file.createdAt} />
          <MessageCount count={file._count.messages} />
        </p>
      </div>

      <FileStatusBadge status={file.uploadStatus} failureReason={file.failureReason} />

      <span className="hidden w-14 text-right text-xs text-muted-foreground sm:block">
        <MessageCount count={file._count.messages} />
      </span>
      <span className="hidden w-32 text-right text-xs text-muted-foreground sm:block">
        <UploadedAt date={file.createdAt} />
      </span>

      <FileActionsMenu file={file} onRename={onRename} onDelete={onDelete} />
    </li>
  );
}
