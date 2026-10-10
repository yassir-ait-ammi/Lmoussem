import Link from "next/link";
import type { EventSummary } from "@/lib/events";
import { formatDay, formatEventDate, formatMonth } from "@/lib/format";
import { isPast } from "@/lib/rules";
import type { SessionUser } from "@/lib/session";
import CapacityBar from "./CapacityBar";
import DeleteEventButton from "./DeleteEventButton";
import RegisterButton from "./RegisterButton";
import { buttonSecondary, card } from "./ui";

type Props = {
  event: EventSummary;
  user: SessionUser | null;
};

export default function EventCard({ event, user }: Props) {
  const past = isPast(event.date, new Date());

  return (
    <article className={`flex flex-col gap-4 p-5 ${card}`}>
      <div className="flex items-start gap-4">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-brand-soft py-2 text-brand-strong">
          <span className="text-xs font-medium uppercase">
            {formatMonth(event.date)}
          </span>
          <span className="text-xl font-semibold leading-tight">
            {formatDay(event.date)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              <Link href={`/events/${event.id}`} className="hover:text-brand">
                {event.title}
              </Link>
            </h2>
            {past && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                Past
              </span>
            )}
            {event.isRegistered && (
              <span className="rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
                Registered
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {formatEventDate(event.date)} · {event.place}
          </p>
        </div>
      </div>

      <p className="line-clamp-3 text-sm text-ink/80">{event.description}</p>

      <CapacityBar
        capacity={event.capacity}
        registeredCount={event.registeredCount}
        remaining={event.remaining}
      />

      <div className="mt-auto flex flex-wrap items-start gap-2">
        <RegisterButton
          eventId={event.id}
          isLoggedIn={user !== null}
          isRegistered={event.isRegistered}
          isFull={event.remaining === 0}
          isPast={past}
        />
        {user?.role === "ADMIN" && (
          <>
            <Link href={`/events/${event.id}/edit`} className={buttonSecondary}>
              Edit
            </Link>
            <DeleteEventButton eventId={event.id} />
          </>
        )}
      </div>
    </article>
  );
}
