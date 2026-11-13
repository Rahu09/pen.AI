"use client";

import { pdfjs } from "react-pdf";

// pdf.js parses PDFs in a web worker. Every component that renders a PDF must
// import Document and Page from this file so the worker is set up exactly once.
//
// `new URL(..., import.meta.url)` makes webpack copy the worker file into our
// own build and give back its URL, so it is served from this site. Before,
// it came from a CDN, which meant a third-party request on every PDF view
// and a page that broke if the CDN's copy did not match the installed
// version. `pdfjs-dist` is pinned in package.json to the exact version
// react-pdf uses, because the worker and the main library must match.
//
// react-pdf stays on 7.x (pdf.js 3) until the Next 15/16 upgrade: pdf.js 4
// and later ship as `.mjs` modules that Next 14's webpack fails to load
// ("Object.defineProperty called on non-object"), and react-pdf 11 needs
// React 19.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export { Document, Page } from "react-pdf";
