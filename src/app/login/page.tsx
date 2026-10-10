import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { card } from "@/components/ui";
import { safeNextPath } from "@/lib/client";
import { getCurrentUser } from "@/lib/session";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = { title: "Log in · Lmoussem" };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNextPath(next);
  if (await getCurrentUser()) redirect(target);

  return (
    <div className={`mx-auto w-full max-w-md p-6 sm:p-8 ${card}`}>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Log in</h1>
      <LoginForm next={target} />
    </div>
  );
}
