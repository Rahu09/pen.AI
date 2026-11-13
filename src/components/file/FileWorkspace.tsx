"use client";

import { useState } from "react";
import { useHasMounted } from "@/lib/use-has-mounted";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import ChatWrapper from "@/components/chat/ChatWrapper";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PdfNavigationContext } from "./pdf-navigation";

// A PDF canvas has nothing to show before the browser runs, so the viewer
// (and pdf.js with it) is loaded in the browser only, as the thumbnails are.
// This also keeps pdf.js out of the server render.
const PdfRenderer = dynamic(() => import("@/components/PdfRenderer"), {
  ssr: false,
  loading: () => <Skeleton className="m-4 h-[calc(100%-2rem)]" />,
});

type WorkspaceFile ={ id: string; name: string; url: string };
type Tab = "pdf" | "chat";

const TABS = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "chat", label: "Chat", icon: MessageSquare },
] as const;

// The hook reads storage while rendering, which also happens on the server,
// where there is no localStorage. Private windows can also refuse access.
// Either way: no saved split, use the defaults.
const browserStorage = {
  getItem(key: string) {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // not saved; the default split is used next time
    }
  },
};

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
  const mounted = useHasMounted();
  const isWide = useMediaQuery("(min-width: 1024px)");

  const [tab, setTab] = useState<Tab>("pdf");

  // The PDF's current page lives here, not in the viewer, so the chat can
  // change it: clicking a page citation in an answer jumps there. On narrow
  // screens the PDF is on its own tab, so the jump also switches to it.
  const [page, setPage] = useState(1);
  const showPage = (target: number) => {
    setPage(target);
    if (!isWide) setTab("pdf");
  };

  // Remembers where the user left the divider (localStorage, per browser).
  // Only drags count, not window resizes.
  const split = useDefaultLayout({
    id: "penai:file-split",
    panelIds: ["pdf", "chat"],
    onlySaveAfterUserInteractions: true,
    storage: browserStorage,
  });

  return (
    <PdfNavigationContext.Provider value={showPage}>
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
        // Sizes as strings are percentages; plain numbers would be pixels.
        <Group
          orientation="horizontal"
          defaultLayout={split.defaultLayout}
          onLayoutChanged={split.onLayoutChanged}
          className="min-h-0 flex-1"
        >
          <Panel id="pdf" defaultSize="58%" minSize="30%">
            <PdfRenderer url={file.url} page={page} onPageChange={setPage} />
          </Panel>
          <Separator
            aria-label="Resize PDF and chat"
            className="group relative w-px bg-border outline-none transition-colors hover:bg-primary focus-visible:bg-primary data-[separator=active]:bg-primary"
          >
            {/* wider invisible hit area, so the 1px line is easy to grab */}
            <span className="absolute inset-y-0 -left-1.5 w-3" />
          </Separator>
          <Panel id="chat" defaultSize="42%" minSize="28%">
            <ChatWrapper fileId={file.id} />
          </Panel>
        </Group>
      ) : (
        <div className="min-h-0 flex-1">
          <div
            role="tabpanel"
            aria-label="PDF"
            className={cn("h-full", tab !== "pdf" && "hidden")}
          >
            <PdfRenderer url={file.url} page={page} onPageChange={setPage} />
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
    </PdfNavigationContext.Provider>
  );
}
