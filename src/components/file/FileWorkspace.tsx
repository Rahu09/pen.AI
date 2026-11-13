"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ChatWrapper from "@/components/chat/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WorkspaceFile = { id: string; name: string; url: string };
type Tab = "pdf" | "chat";

const TABS = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "chat", label: "Chat", icon: MessageSquare },
] as const;

/**
 * A single file's page: the PDF and its chat.
 *
 * Wide screens show both side by side with a draggable divider; the split is
 * remembered. Narrow screens show one at a time, switched by tabs. Both stay
 * mounted when hidden so the chat and the PDF position are not lost.
 */
export default function FileWorkspace({ file }: { file: WorkspaceFile }) {
  // Which layout applies is only known in the browser. Waiting for mount
  // avoids rendering one layout and then replacing it with the other.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isWide = useMediaQuery("(min-width: 1024px)");

  const [tab, setTab] = useState<Tab>("pdf");

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <Link
          href="/dashboard"
          aria-label="Back to files"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium" title={file.name}>
          {file.name}
        </h1>

        <div
          role="tablist"
          aria-label="Show"
          className="flex rounded-md border p-0.5 lg:hidden"
        >
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-xs font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                tab === value && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {!mounted ? (
        <div className="min-h-0 flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      ) : isWide ? (
        <PanelGroup
          direction="horizontal"
          autoSaveId="penai:file-split"
          className="min-h-0 flex-1"
        >
          <Panel defaultSize={58} minSize={30}>
            <PdfRenderer url={file.url} />
          </Panel>
          <PanelResizeHandle
            aria-label="Resize PDF and chat"
            className="group relative w-px bg-border outline-none transition-colors hover:bg-primary focus-visible:bg-primary data-[resize-handle-state=drag]:bg-primary"
          >
            {/* wider invisible hit area, so the 1px line is easy to grab */}
            <span className="absolute inset-y-0 -left-1.5 w-3" />
          </PanelResizeHandle>
          <Panel defaultSize={42} minSize={28}>
            <ChatWrapper fileId={file.id} />
          </Panel>
        </PanelGroup>
      ) : (
        <div className="min-h-0 flex-1">
          <div
            role="tabpanel"
            aria-label="PDF"
            className={cn("h-full", tab !== "pdf" && "hidden")}
          >
            <PdfRenderer url={file.url} />
          </div>
          <div
            role="tabpanel"
            aria-label="Chat"
            className={cn("h-full", tab !== "chat" && "hidden")}
          >
            <ChatWrapper fileId={file.id} />
          </div>
        </div>
      )}
    </div>
  );
}
