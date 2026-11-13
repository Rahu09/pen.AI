"use client";

import { pdfjs } from "react-pdf";

// pdf.js parses PDFs in a web worker. Every component that renders a PDF must
// import Document and Page from this file so the worker is set up exactly once.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export { Document, Page } from "react-pdf";
