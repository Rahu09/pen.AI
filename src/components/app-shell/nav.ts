import { CreditCard, Files, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const isBilling = (pathname: string) =>
  pathname.startsWith("/dashboard/billing");

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Files",
    href: "/dashboard",
    icon: Files,
    // the file list and any single file page
    isActive: (pathname) =>
      pathname.startsWith("/dashboard") && !isBilling(pathname),
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    isActive: isBilling,
  },
];

/** True on a single file's page, where the PDF and chat need the width. */
export const isFilePage = (pathname: string) =>
  /^\/dashboard\/[^/]+$/.test(pathname) && !isBilling(pathname);
