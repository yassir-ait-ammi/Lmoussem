import Link from "next/link";
import { notFound } from "next/navigation";
import CapacityBar from "@/components/CapacityBar";
import DeleteEventButton from "@/components/DeleteEventButton";
import RegisterButton from "@/components/RegisterButton";
import { buttonSecondary, card } from "@/components/ui";
import { AppError } from "@/lib/errors";
import { getEvent, listParticipants } from "@/lib/events";
import { formatEventDate } from "@/lib/format";
import { isPast } from "@/lib/rules";
import { getCurrentUser } from "@/lib/session";

type Props = {
  params: Promise<{ id: string }>;
};

async function loadEvent(id: string, userId?: string) {
  try {
    return await getEvent(id, userId);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const event = await loadEvent(id, user?.id);
  const isAdmin = user?.role === "ADMIN";
  const participants = isAdmin ? await listParticipants(id) : [];
  const past = isPast(event.date, new Date());

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← All events
      </Link>

      <article className={`flex flex-col gap-5 p-6 sm:p-8 ${card}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
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
          <p className="mt-2 text-sm text-muted">
            {formatEventDate(event.date)} (Morocco time) · {event.place}
          </p>
        </div>

        <p className="whitespace-pre-line text-ink/90">{event.description}</p>

        <CapacityBar
          capacity={event.capacity}
          registeredCount={event.registeredCount}
          remaining={event.remaining}
        />

        <div className="flex flex-wrap items-start gap-2">
          <RegisterButton
            eventId={event.id}
            isLoggedIn={user !== null}
            isRegistered={event.isRegistered}
            isFull={event.remaining === 0}
            isPast={past}
          />
          {isAdmin && (
            <>
              <Link href={`/events/${event.id}/edit`} className={buttonSecondary}>
                Edit
              </Link>
              <DeleteEventButton eventId={event.id} redirectTo="/" />
            </>
          )}
        </div>
      </article>

      {isAdmin && (
        <section className={`p-6 sm:p-8 ${card}`}>
          <h2 className="text-lg font-semibold tracking-tight">
            Participants ({participants.length})
          </h2>
          {participants.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nobody has registered yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 font-medium">Registered on</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id} className="border-t border-line">
                      <td className="py-2 pr-4">{participant.name}</td>
                      <td className="py-2 pr-4 text-muted">{participant.email}</td>
                      <td className="py-2 text-muted">
                        {formatEventDate(participant.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
