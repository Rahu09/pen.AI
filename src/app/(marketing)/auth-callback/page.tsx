"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { afterSignInPath } from "@/lib/safe-redirect";

function AuthCallback() {
  const router = useRouter();
  const origin = useSearchParams().get("origin");

  const { data, error } = trpc.authCallback.useQuery(undefined, {
    // Keep trying while the session settles, but not when the server says
    // there is no session at all: that will not fix itself.
    retry: (_count, err) => err.data?.code !== "UNAUTHORIZED",
    retryDelay: 500,
  });

  // React Query 5 removed onSuccess / onError from queries; redirects are
  // side effects of the result, so they live in an effect.
  useEffect(() => {
    // user is synced to db
    if (data?.success) router.push(afterSignInPath(origin));
  }, [data, origin, router]);

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") router.push("/sign-in");
  }, [error, router]);

  return <Waiting />;
}

function Waiting() {
  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
}

// useSearchParams() needs a Suspense boundary, or Next 14 refuses to build the
// page: the search params only exist in the browser, so the server renders the
// fallback and the browser fills in the rest.
export default function Page() {
  return (
    <Suspense fallback={<Waiting />}>
      <AuthCallback />
    </Suspense>
  );
}
