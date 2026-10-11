"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useTransition } from "react";
import type { EventFilters as Filters } from "@/lib/validation";
import { buttonSecondary, card, input, label } from "./ui";

type Props = {
  filters: Filters;
  places: string[];
};

const SEARCH_DELAY_MS = 350;

export default function EventFilters({ filters, places }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const values: Record<string, string> = {
      q: filters.q ?? "",
      place: filters.place ?? "",
      from: filters.from ?? "",
      to: filters.to ?? "",
    };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name) as HTMLInputElement | null;
      if (field && field !== document.activeElement) field.value = value;
    }
    const available = form.elements.namedItem("available") as HTMLInputElement | null;
    if (available) available.checked = filters.available;
  }, [filters]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(mode: "push" | "replace") {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value !== "") params.set(key, value);
    }
    const query = params.toString();
    const url = query ? `/?${query}` : "/";
    startTransition(() => {
      if (mode === "replace") router.replace(url);
      else router.push(url);
    });
  }

  function onChange(event: FormEvent<HTMLFormElement>) {
    clearTimeout(timer.current);
    if ((event.target as HTMLInputElement).name === "q") {
      // typing: wait for a pause, and do not fill the browser history
      timer.current = setTimeout(() => apply("replace"), SEARCH_DELAY_MS);
    } else {
      apply("push");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearTimeout(timer.current);
    apply("push");
  }

  function reset() {
    clearTimeout(timer.current);
    for (const field of formRef.current?.elements ?? []) {
      if (field instanceof HTMLInputElement && field.type === "checkbox") field.checked = false;
      else if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = "";
    }
    startTransition(() => router.push("/"));
  }

  return (
    <form
      ref={formRef}
      method="get"
      aria-busy={pending}
      action="/"
      onChange={onChange}
      onSubmit={onSubmit}
      className={`grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5 ${card}`}
    >
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

        <div className="flex items-center gap-3">
          {pending && (
            <span role="status" className="flex items-center gap-2 text-sm text-muted">
              <span className="size-4 animate-spin rounded-full border-2 border-line border-t-brand" />
              Updating...
            </span>
          )}
          <button type="button" onClick={reset} className={buttonSecondary}>
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
