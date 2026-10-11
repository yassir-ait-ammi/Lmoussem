import { listPlaces } from "@/lib/events";
import type { EventFilters as Filters } from "@/lib/validation";
import EventFilters from "./EventFilters";

export default async function FiltersSection({ filters }: { filters: Filters }) {
  const places = await listPlaces();
  return <EventFilters filters={filters} places={places} />;
}
