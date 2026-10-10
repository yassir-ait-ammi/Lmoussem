type Props = {
  capacity: number;
  registeredCount: number;
  remaining: number;
};

export default function CapacityBar({ capacity, registeredCount, remaining }: Props) {
  const percent = Math.min(Math.round((registeredCount / capacity) * 100), 100);
  const full = remaining === 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>
          {registeredCount} / {capacity} registered
        </span>
        <span className={full ? "font-medium text-danger" : "font-medium text-ok"}>
          {full ? "Full" : `${remaining} ${remaining === 1 ? "place" : "places"} left`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full ${full ? "bg-danger" : "bg-brand"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
