import Link from "next/link";
import StatusMessage from "@/components/StatusMessage";
import { buttonPrimary } from "@/components/ui";

export const metadata = { title: "Access denied · Lmoussem" };

export default function Forbidden() {
  return (
    <StatusMessage
      code="403"
      title="Access denied"
      message="This page is reserved for administrators. Your account does not have permission to open it."
    >
      <Link href="/" className={buttonPrimary}>
        Back to events
      </Link>
    </StatusMessage>
  );
}
