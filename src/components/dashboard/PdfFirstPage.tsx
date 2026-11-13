"use client";

import { useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { Document, Page } from "@/lib/pdfjs";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";

/** Renders page 1 of a PDF at the width of its container. */
export default function PdfFirstPage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: "debounce",
    refreshRate: 200,
  });

  if (failed) return <ThumbnailPlaceholder />;

  return (
    <div ref={ref} className="h-full w-full bg-white">
      {width ? (
        <Document
          file={url}
          loading={<ThumbnailPlaceholder pulse />}
          error={<ThumbnailPlaceholder />}
          onLoadError={() => setFailed(true)}
        >
          <Page
            pageNumber={1}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={<ThumbnailPlaceholder pulse />}
          />
        </Document>
      ) : null}
    </div>
  );
}
