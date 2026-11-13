"use client";

import { pdfjs } from "react-pdf";

// pdf.js parses PDFs in a web worker. Every component that renders a PDF must
// import Document and Page from this file so the worker is set up exactly once.
//
// `new URL(..., import.meta.url)` makes the bundler copy the worker file into
// our own build and give back its URL, so it is served from this site rather
// than a CDN. `pdfjs-dist` is pinned in package.json to the exact version
// react-pdf depends on, because the worker and the main library must match.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export { Document, Page } from "react-pdf";
