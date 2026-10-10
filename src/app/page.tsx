import Link from "next/link";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import { buttonPrimary, card } from "@/components/ui";
import { listEvents, listPlaces } from "@/lib/events";
import { getCurrentUser } from "@/lib/session";
import { eventFiltersSchema } from "@/lib/validation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValues(params: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export default async function HomePage({ searchParams }: Props) {
  const parsed = eventFiltersSchema.safeParse(firstValues(await searchParams));
  const filters = parsed.success ? parsed.data : eventFiltersSchema.parse({});

  const user = await getCurrentUser();
  const [events, places] = await Promise.all([
    listEvents(filters, user?.id),
    listPlaces(),
  ]);

  const filtered = Boolean(
    filters.q || filters.place || filters.from || filters.to || filters.available,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted">
            {events.length} {events.length === 1 ? "event" : "events"}
            {filtered ? " matching your filters" : ""}
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Link href="/events/new" className={buttonPrimary}>
            New event
          </Link>
        )}
      </div>

      <EventFilters filters={filters} places={places} />

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
