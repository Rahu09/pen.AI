import type { AppRouter } from "@/trpc";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

/** One file as the dashboard receives it (dates arrive as ISO strings). */
export type UserFile = RouterOutput["getUserFiles"][number];

export type SortKey = "newest" | "oldest" | "name" | "messages";
export type ViewMode = "grid" | "list";

export const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name (A to Z)",
  messages: "Most messages",
};

export function sortFiles(files: UserFile[], sort: SortKey): UserFile[] {
  const time = (file: UserFile) => new Date(file.createdAt).getTime();

  // copy first: the array belongs to the query cache and must not be mutated
  return [...files].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return time(a) - time(b);
      case "name":
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      case "messages":
        return b._count.messages - a._count.messages || time(b) - time(a);
      default:
        return time(b) - time(a);
    }
  });
}
