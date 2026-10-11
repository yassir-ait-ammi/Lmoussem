"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { apiRequest } from "@/lib/client";
import PasswordInput from "./PasswordInput";
import { buttonPrimary, fieldError, formError, input, label } from "./ui";

type Props = {
  next: string;
};

export default function SignupForm({ next }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);

    const created = await apiRequest("/api/users", "POST", {
      name,
      email,
      password,
    });

    if (!created.ok) {
      setErrors(created.error.fields ?? {});
      setMessage(created.error.fields ? null : created.error.message);
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      router.push("/login");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {message && (
        <p role="alert" className={formError}>
          {message}
        </p>
      )}

      <div>
        <label htmlFor="name" className={label}>
          Name
        </label>
        <input
          id="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={input}
        />
        {errors.name && <p className={fieldError}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={input}
        />
        {errors.email && <p className={fieldError}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className={label}>
          Password
        </label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        {errors.password && <p className={fieldError}>{errors.password}</p>}
      </div>

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-muted">
        Already registered?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-brand hover:text-brand-strong"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
