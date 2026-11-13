import { Aurora } from "@/components/Aurora";

/**
 * The aurora, quietly, behind the top of a page in the app. It fades out
 * downwards so the content below sits on plain paper.
 */
export function PageWash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 opacity-90 [mask-image:linear-gradient(to_bottom,black,transparent)] dark:opacity-70"
    >
      <Aurora className="h-full" intensity={0.6} />
    </div>
  );
}
