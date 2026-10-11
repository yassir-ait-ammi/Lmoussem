import Link from "next/link";
import { listEvents } from "@/lib/events";
import { getCurrentUser } from "@/lib/session";
import type { EventFilters } from "@/lib/validation";
import EventCard from "./EventCard";
import { buttonPrimary, card } from "./ui";

export default async function EventList({ filters }: { filters: EventFilters }) {
  const user = await getCurrentUser();
  const events = await listEvents(filters, user?.id);

  const filtered = Boolean(
    filters.q || filters.place || filters.from || filters.to || filters.available,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {events.length} {events.length === 1 ? "event" : "events"}
          {filtered ? " matching your filters" : ""}
        </p>
        {user?.role === "ADMIN" && (
          <Link href="/events/new" className={buttonPrimary}>
            New event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className={`p-10 text-center ${card}`}>
          <p className="font-medium">
            {filtered ? "No event matches these filters" : "No events yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {filtered
              ? "Change or reset the filters to see more events."
              : user?.role === "ADMIN"
                ? "Create the first event to get started."
                : "Come back soon, new events are added regularly."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
