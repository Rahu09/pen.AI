"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { UserFile } from "./types";

const MAX_NAME_LENGTH = 120;

export function RenameFileDialog({
  file,
  onClose,
  onRename,
}: {
  /** The file being renamed, or null when the dialog is closed */
  file: UserFile | null;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
}) {
  const [name, setName] = useState(file?.name ?? "");

  // Start from the current name each time the dialog opens for a file.
  // Adjusting state while rendering (React's recommended pattern) instead of
  // in an effect avoids a second render with the stale name.
  const [shownFile, setShownFile] = useState(file);
  if (file !== shownFile) {
    setShownFile(file);
    if (file) setName(file.name);
  }

  const trimmed = name.trim();
  const canSave =
    trimmed.length > 0 &&
    trimmed.length <= MAX_NAME_LENGTH &&
    trimmed !== file?.name;

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!file || !canSave) return;
            onRename(file.id, trimmed);
            onClose();
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              This changes the name shown here. The PDF itself is not changed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <label htmlFor="file-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="file-name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(event) => setName(event.target.value)}
              onFocus={(event) => event.target.select()}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFileDialog({
  file,
  isDeleting,
  onClose,
  onDelete,
}: {
  file: UserFile | null;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const messages = file?._count.messages ?? 0;

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this file?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{file?.name}</span>{" "}
            will be deleted
            {messages > 0
              ? `, along with its ${messages} chat ${
                  messages === 1 ? "message" : "messages"
                }`
              : ""}
            . This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:space-x-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => {
              if (!file) return;
              onDelete(file.id);
              onClose();
            }}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Delete file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
