import Link from "next/link";
import StatusMessage from "@/components/StatusMessage";
import { buttonPrimary } from "@/components/ui";

export const metadata = { title: "Page not found · Lmoussem" };

export default function NotFound() {
  return (
    <StatusMessage
      code="404"
      title="Page not found"
      message="The page you are looking for does not exist or has been moved."
    >
      <Link href="/" className={buttonPrimary}>
        Back to events
      </Link>
    </StatusMessage>
  );
}
