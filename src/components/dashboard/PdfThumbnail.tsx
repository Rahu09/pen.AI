"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useIntersection } from "@mantine/hooks";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";

// pdf.js is large and browser-only, so it is loaded on demand, never on the
// server and never for cards that are not shown.
const PdfFirstPage = dynamic(() => import("./PdfFirstPage"), {
  ssr: false,
  loading: () => <ThumbnailPlaceholder pulse />,
});

/**
 * Preview of a PDF's first page. Rendering starts only once the card scrolls
 * near the viewport, so a long list does not download every file at once.
 */
export function PdfThumbnail({
  url,
  enabled,
}: {
  url: string;
  /** false for files that are still processing or failed */
  enabled: boolean;
}) {
  const { ref, entry } = useIntersection({ rootMargin: "200px" });
  const [wasSeen, setWasSeen] = useState(false);

  useEffect(() => {
    if (entry?.isIntersecting) setWasSeen(true);
  }, [entry]);

  return (
    <div ref={ref} className="h-full w-full">
      {enabled && wasSeen ? <PdfFirstPage url={url} /> : <ThumbnailPlaceholder />}
    </div>
  );
}
