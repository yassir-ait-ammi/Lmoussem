import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/session";
import { buttonPrimary, buttonSecondary } from "./ui";

async function logOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-brand"
          >
            <Image src="/logo.png" alt="" width={36} height={36} priority unoptimized className="size-9" />
            Lmoussem
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/" className="hover:text-ink">
              Events
            </Link>
            {user?.role === "ADMIN" && (
              <Link href="/events/new" className="hover:text-ink">
                New event
              </Link>
            )}
          </nav>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {user.name}
              <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-strong">
                {user.role === "ADMIN" ? "Admin" : "User"}
              </span>
            </span>
            <form action={logOut}>
              <button type="submit" className={buttonSecondary}>
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonSecondary}>
              Log in
            </Link>
            <Link href="/signup" className={buttonPrimary}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
