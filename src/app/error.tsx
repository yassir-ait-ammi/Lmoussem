"use client";

import Link from "next/link";
import { useEffect } from "react";
import StatusMessage from "@/components/StatusMessage";
import { buttonPrimary, buttonSecondary } from "@/components/ui";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusMessage
      code="500"
      title="Something went wrong"
      message="An unexpected error occurred on our side. Try again in a moment."
    >
      <button type="button" onClick={() => retry()} className={buttonPrimary}>
        Try again
      </button>
      <Link href="/" className={buttonSecondary}>
        Back to events
      </Link>
    </StatusMessage>
  );
}
