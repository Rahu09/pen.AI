import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { PlanProvider, type PlanInfo } from "./plan-context";
import type { ShellUser } from "./UserMenu";

/**
 * Frame for every signed-in page: sidebar on wide screens, a top bar on narrow
 * ones, and a scrollable main area. The page fills the viewport exactly, so
 * pages inside can use `h-full` instead of computing heights from the viewport.
 */
export function AppShell({
  user,
  plan,
  children,
}: {
  user: ShellUser;
  plan: PlanInfo;
  children: ReactNode;
}) {
  return (
    <PlanProvider plan={plan}>
      <div className="grain relative flex h-[100dvh] bg-background text-foreground">
        <AppSidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader user={user} />
          <main className="relative isolate min-h-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </PlanProvider>
  );
}
