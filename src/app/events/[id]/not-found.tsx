import Link from "next/link";
import StatusMessage from "@/components/StatusMessage";
import { buttonPrimary } from "@/components/ui";

export default function EventNotFound() {
  return (
    <StatusMessage
      code="404"
      title="Event not found"
      message="This event does not exist. It may have been deleted, or the link is incorrect."
    >
      <Link href="/" className={buttonPrimary}>
        Browse all events
      </Link>
    </StatusMessage>
  );
}
