export type RegistrationRefusal =
  | "ALREADY_REGISTERED"
  | "EVENT_PASSED"
  | "EVENT_FULL";

export type RegistrationContext = {
  capacity: number;
  registeredCount: number;
  alreadyRegistered: boolean;
  eventDate: Date;
  now: Date;
};

export function remainingPlaces(capacity: number, registeredCount: number) {
  return Math.max(capacity - registeredCount, 0);
}

export function isFull(capacity: number, registeredCount: number) {
  return remainingPlaces(capacity, registeredCount) === 0;
}

export function isPast(eventDate: Date, now: Date) {
  return eventDate.getTime() < now.getTime();
}

export function checkRegistration(
  context: RegistrationContext,
): RegistrationRefusal | null {
  if (context.alreadyRegistered) return "ALREADY_REGISTERED";
  if (isPast(context.eventDate, context.now)) return "EVENT_PASSED";
  if (isFull(context.capacity, context.registeredCount)) return "EVENT_FULL";
  return null;
}

export function canLowerCapacity(newCapacity: number, registeredCount: number) {
  return newCapacity >= registeredCount;
}
