import { Suspense } from "react";
import EventList from "@/components/EventList";
import EventListSkeleton from "@/components/EventListSkeleton";
import FiltersSection from "@/components/FiltersSection";
import Skeleton from "@/components/Skeleton";
import { card } from "@/components/ui";
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
  const params = firstValues(await searchParams);
  const parsed = eventFiltersSchema.safeParse(params);
  const filters = parsed.success ? parsed.data : eventFiltersSchema.parse({});

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Events</h1>

      {/* No key: the filter form stays mounted (and focused) while the list reloads. */}
      <Suspense
        fallback={
          <div className={`p-5 ${card}`}>
            <Skeleton className="h-24 w-full" />
          </div>
        }
      >
        <FiltersSection filters={filters} />
      </Suspense>

      {/* Keyed by the query so a filter change shows the skeleton for the list only. */}
      <Suspense key={JSON.stringify(filters)} fallback={<EventListSkeleton />}>
        <EventList filters={filters} />
      </Suspense>
    </div>
  );
}
