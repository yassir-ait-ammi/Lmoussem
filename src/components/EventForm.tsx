"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";
import {
  buttonPrimary,
  buttonSecondary,
  fieldError,
  formError,
  input,
  label,
} from "./ui";

type Values = {
  title: string;
  description: string;
  date: string;
  place: string;
  capacity: string;
};

type Props = {
  eventId?: string;
  initialValues?: Values;
};

const emptyValues: Values = {
  title: "",
  description: "",
  date: "",
  place: "",
  capacity: "",
};

export default function EventForm({ eventId, initialValues }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues ?? emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);

    const parsedDate = new Date(values.date);
    const body = {
      ...values,
      date: Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString(),
    };

    const result = eventId
      ? await apiRequest<{ event: { id: string } }>(`/api/events/${eventId}`, "PUT", body)
      : await apiRequest<{ event: { id: string } }>("/api/events", "POST", body);

    if (!result.ok) {
      setErrors(result.error.fields ?? {});
      setMessage(result.error.fields ? null : result.error.message);
      setPending(false);
      return;
    }

    router.push(`/events/${result.data.event.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {message && (
        <p role="alert" className={formError}>
          {message}
        </p>
      )}

      <div>
        <label htmlFor="title" className={label}>
          Title
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          className={input}
        />
        {errors.title && <p className={fieldError}>{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className={label}>
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          className={input}
        />
        {errors.description && <p className={fieldError}>{errors.description}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={label}>
            Date and time
          </label>
          <input
            id="date"
            type="datetime-local"
            value={values.date}
            onChange={(event) => update("date", event.target.value)}
            className={input}
          />
          {errors.date && <p className={fieldError}>{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="capacity" className={label}>
            Maximum capacity
          </label>
          <input
            id="capacity"
            type="number"
            min={1}
            step={1}
            value={values.capacity}
            onChange={(event) => update("capacity", event.target.value)}
            className={input}
          />
          {errors.capacity && <p className={fieldError}>{errors.capacity}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="place" className={label}>
          Place
        </label>
        <input
          id="place"
          value={values.place}
          onChange={(event) => update("place", event.target.value)}
          className={input}
        />
        {errors.place && <p className={fieldError}>{errors.place}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Saving..." : eventId ? "Save changes" : "Create event"}
        </button>
        <Link href={eventId ? `/events/${eventId}` : "/"} className={buttonSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
