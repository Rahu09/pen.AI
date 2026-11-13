import Link from "next/link";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import { arrowNudge, buttonSize, inkButton } from "./marketing/styles";
import { cn } from "@/lib/utils";
import UserAccountNav from "./UserAccountNav";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./app-shell/ThemeToggle";

const navLink =
  "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/75 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/** Top bar of the public pages. The signed-in app has its own shell. */
const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav
      aria-label="Main"
      className="sticky inset-x-0 top-0 z-30 h-16 w-full bg-background/75 backdrop-blur-lg"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="pen.AI home"
          className="rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        >
          <Wordmark />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle side="bottom" />
          <Link
            href="/pricing"
            className={navLink}
          >
            Pricing
          </Link>

          {!user ? (
            <>
              <LoginLink className={navLink}>
                Sign in
              </LoginLink>
              <RegisterLink className={cn(inkButton, buttonSize.sm)}>
                Get started
                <ArrowRight className={arrowNudge} aria-hidden="true" />
              </RegisterLink>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={navLink}
              >
                Dashboard
              </Link>

              <UserAccountNav
                name={
                  !user.given_name || !user.family_name
                    ? "Your Account"
                    : `${user.given_name} ${user.family_name}`
                }
                email={user.email ?? ""}
                imageUrl={user.picture ?? ""}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
