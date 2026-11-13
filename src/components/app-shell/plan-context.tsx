"use client";

import { createContext, useContext, type ReactNode } from "react";

/** The limits of the signed-in user's plan, resolved on the server. */
export type PlanInfo = {
  name: string;
  isSubscribed: boolean;
  /** PDFs that can be uploaded per calendar month */
  quota: number;
  pagesPerPdf: number;
  maxFileSizeMb: number;
};

const PlanContext = createContext<PlanInfo | null>(null);

export function PlanProvider({
  plan,
  children,
}: {
  plan: PlanInfo;
  children: ReactNode;
}) {
  return <PlanContext.Provider value={plan}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const plan = useContext(PlanContext);
  if (!plan) throw new Error("usePlan must be used inside the app shell");
  return plan;
}
