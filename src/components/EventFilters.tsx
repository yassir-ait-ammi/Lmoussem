import Link from "next/link";
import type { EventFilters as Filters } from "@/lib/validation";
import { buttonPrimary, buttonSecondary, card, input, label } from "./ui";

type Props = {
  filters: Filters;
  places: string[];
};

export default function EventFilters({ filters, places }: Props) {
  return (
    <form method="get" action="/" className={`grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5 ${card}`}>
      <div className="sm:col-span-2 lg:col-span-2">
        <label htmlFor="q" className={label}>
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Title or description"
          defaultValue={filters.q ?? ""}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="place" className={label}>
          Place
        </label>
        <select
          id="place"
          name="place"
          defaultValue={filters.place ?? ""}
          className={input}
        >
          <option value="">All places</option>
          {places.map((place) => (
            <option key={place} value={place}>
              {place}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="from" className={label}>
          From
        </label>
        <input
          id="from"
          name="from"
          type="date"
          defaultValue={filters.from ?? ""}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="to" className={label}>
          To
        </label>
        <input
          id="to"
          name="to"
          type="date"
          defaultValue={filters.to ?? ""}
          className={input}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-5">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={filters.available}
            className="size-4 accent-brand"
          />
          Only events with places left
        </label>

        <div className="flex items-center gap-2">
          <Link href="/" className={buttonSecondary}>
            Reset
          </Link>
          <button type="submit" className={buttonPrimary}>
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}
