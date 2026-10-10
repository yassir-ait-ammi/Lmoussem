import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { card } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "New event · Lmoussem" };

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/new");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className={`mx-auto w-full max-w-2xl p-6 sm:p-8 ${card}`}>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New event</h1>
      <EventForm />
    </div>
  );
}
