import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) return `https://pen-ai.vercel.app${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata({
  title = "pen.AI - Chat with your PDFs",
  description = "Upload a PDF and ask it questions. pen.AI finds the passages that matter and answers from what the document says.",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@TiRahu86",
    },
    icons,
    metadataBase: new URL("https://pen-ai.vercel.app/"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
