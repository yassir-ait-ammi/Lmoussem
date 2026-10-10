import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { card } from "@/components/ui";
import { AppError } from "@/lib/errors";
import { getEvent } from "@/lib/events";
import { toDateTimeInput } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = { title: "Edit event · Lmoussem" };

async function loadEvent(id: string) {
  try {
    return await getEvent(id);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/events/${id}/edit`);
  if (user.role !== "ADMIN") redirect("/");

  const event = await loadEvent(id);

  return (
    <div className={`mx-auto w-full max-w-2xl p-6 sm:p-8 ${card}`}>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit event</h1>
      <EventForm
        eventId={event.id}
        initialValues={{
          title: event.title,
          description: event.description,
          date: toDateTimeInput(event.date),
          place: event.place,
          capacity: String(event.capacity),
        }}
      />
    </div>
  );
}
