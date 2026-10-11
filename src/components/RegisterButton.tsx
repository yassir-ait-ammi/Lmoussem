"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";
import { useRegistration } from "./RegistrationProvider";
import { buttonPrimary, buttonSecondary } from "./ui";

type Props = {
  eventId: string;
  isLoggedIn: boolean;
  isPast: boolean;
};

export default function RegisterButton({ eventId, isLoggedIn, isPast }: Props) {
  const router = useRouter();
  const { registered, remaining, confirm } = useRegistration();
  const isFull = remaining === 0;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(method: "POST" | "DELETE") {
    setPending(true);
    setError(null);
    const result = await apiRequest(`/api/events/${eventId}/registrations`, method);
    // the server answer is the truth: after a failure fall back to the props
    confirm(result.ok ? method === "POST" : null);
    if (!result.ok) setError(result.error.message);
    router.refresh();
    setPending(false);
  }

  if (isPast) {
    return (
      <button type="button" disabled className={buttonSecondary}>
        Event ended
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link href={`/login?next=/events/${eventId}`} className={buttonSecondary}>
        Log in to register
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {registered ? (
        <button
          key="cancel"
          type="button"
          disabled={pending}
          onClick={() => send("DELETE")}
          className={buttonSecondary}
        >
          {pending ? "Cancelling..." : "Cancel registration"}
        </button>
      ) : (
        <button
          key="register"
          type="button"
          disabled={pending || isFull}
          onClick={() => send("POST")}
          className={buttonPrimary}
        >
          {isFull ? "Full" : pending ? "Registering..." : "Register"}
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
