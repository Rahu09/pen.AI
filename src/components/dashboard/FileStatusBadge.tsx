import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserFile } from "./types";

/**
 * Status of a file that is not ready. Ready files show nothing: that is the
 * normal state and does not need a label.
 *
 * Both badges have a border and their own background so they stay readable on
 * top of a thumbnail as well as in a list row, in either theme.
 */
export function FileStatusBadge({
  status,
}: {
  status: UserFile["uploadStatus"];
}) {
  if (status === "SUCCESS") return null;

  if (status === "FAILED") {
    return (
      <Badge
        variant="destructive"
        className="border-destructive-foreground/25"
        title="This PDF could not be processed"
      >
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        Failed
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-background">
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      Processing
    </Badge>
  );
}
