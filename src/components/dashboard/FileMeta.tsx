import { format, formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

/** "3 days ago", with the exact date available on hover and to screen readers. */
export function UploadedAt({ date }: { date: string }) {
  const uploaded = new Date(date);

  return (
    <time dateTime={uploaded.toISOString()} title={format(uploaded, "PPpp")}>
      {formatDistanceToNow(uploaded, { addSuffix: true })}
    </time>
  );
}

export function MessageCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
      {count}
      <span className="sr-only">{count === 1 ? "message" : "messages"}</span>
    </span>
  );
}
