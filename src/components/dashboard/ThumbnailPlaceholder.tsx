import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThumbnailPlaceholder({ pulse = false }: { pulse?: boolean }) {
  return (
    <div
      className={cn(
        // the aurora base colours, so an unrendered page still looks intended
        "flex h-full w-full items-center justify-center bg-[linear-gradient(40deg,#c7d2fe,#e9d5ff)] dark:opacity-40",
        pulse && "animate-pulse"
      )}
    >
      <FileText
        className="h-8 w-8 text-white/80"
        aria-hidden="true"
      />
    </div>
  );
}
