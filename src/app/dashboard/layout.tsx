import { AppShell } from "@/components/app-shell/AppShell";
import { getPlan } from "@/config/stripe";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Signed-out visitors are redirected by the page itself, which knows where
  // to send them back to. Render it bare so that redirect can happen.
  if (!user || !user.id) return <>{children}</>;

  const { isSubscribed } = await getUserSubscriptionPlan();
  const plan = getPlan(isSubscribed);

  return (
    <AppShell
      user={{
        name: [user.given_name, user.family_name].filter(Boolean).join(" "),
        email: user.email ?? "",
        imageUrl: user.picture ?? "",
      }}
      plan={{
        name: plan.name,
        isSubscribed,
        quota: plan.quota,
        pagesPerPdf: plan.pagesPerPdf,
        maxFileSizeMb: plan.maxFileSizeMb,
      }}
    >
      {children}
    </AppShell>
  );
}
