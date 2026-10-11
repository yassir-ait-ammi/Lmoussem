import Skeleton from "@/components/Skeleton";
import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
      role="status"
      aria-label="Loading event"
    >
      <Skeleton className="h-4 w-24" />

      <div className={`flex flex-col gap-5 p-6 sm:p-8 ${card}`}>
        <div>
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
