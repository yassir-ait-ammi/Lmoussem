"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";
import { buttonDanger, buttonSecondary } from "./ui";

type Props = {
  eventId: string;
  redirectTo?: string;
};

export default function DeleteEventButton({ eventId, redirectTo }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setPending(true);
    setError(null);
    const result = await apiRequest(`/api/events/${eventId}`, "DELETE");
    if (!result.ok) {
      setError(result.error.message);
      setPending(false);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonDanger}
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={remove}
          className={buttonDanger}
        >
          {pending ? "Deleting..." : "Confirm delete"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className={buttonSecondary}
        >
          Keep
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
