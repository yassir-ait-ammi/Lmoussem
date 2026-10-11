import EventListSkeleton from "@/components/EventListSkeleton";
import Skeleton from "@/components/Skeleton";
import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
      <div className={`p-5 ${card}`}>
        <Skeleton className="h-24 w-full" />
      </div>
      <EventListSkeleton />
    </div>
  );
}
