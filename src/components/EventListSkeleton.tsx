import Skeleton from "./Skeleton";
import { card } from "./ui";

export default function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading events">
      <Skeleton className="h-5 w-32" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`flex flex-col gap-4 p-5 ${card}`}>
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-14 shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
