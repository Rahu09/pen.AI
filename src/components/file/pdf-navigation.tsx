"use client";

import { createContext, useContext } from "react";

/**
 * Lets anything on a file's page (the chat's page citations) move the PDF
 * viewer to a page. FileWorkspace owns the current page and provides this;
 * outside a workspace it is null and citations render as plain labels.
 */
export const PdfNavigationContext = createContext<
  ((page: number) => void) | null
>(null);

export const usePdfNavigation = () => useContext(PdfNavigationContext);
