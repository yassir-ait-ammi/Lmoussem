import type { Prisma } from "@prisma/client";
import { AppError } from "./errors";
import { prisma } from "./prisma";
import {
  canLowerCapacity,
  checkRegistration,
  remainingPlaces,
  type RegistrationRefusal,
} from "./rules";
import type { EventFilters, EventInput } from "./validation";

export type EventSummary = {
  id: string;
  title: string;
  description: string;
  date: Date;
  place: string;
  capacity: number;
  registeredCount: number;
  remaining: number;
  isRegistered: boolean;
};

export type Participant = {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
};

type EventWithCount = Prisma.EventGetPayload<{
  include: { _count: { select: { registrations: true } } };
}>;

const withCount = {
  _count: { select: { registrations: true } },
} satisfies Prisma.EventInclude;

const refusalMessages: Record<RegistrationRefusal, string> = {
  ALREADY_REGISTERED: "You are already registered for this event",
  EVENT_PASSED: "This event has already taken place",
  EVENT_FULL: "This event is full",
};

function toSummary(event: EventWithCount, isRegistered: boolean): EventSummary {
  const registeredCount = event._count.registrations;
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    place: event.place,
    capacity: event.capacity,
    registeredCount,
    remaining: remainingPlaces(event.capacity, registeredCount),
    isRegistered,
  };
}

function buildWhere(filters: EventFilters): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.place) {
    where.place = { contains: filters.place, mode: "insensitive" };
  }

  if (filters.from || filters.to) {
    const range: Prisma.DateTimeFilter = {};
    if (filters.from) range.gte = new Date(`${filters.from}T00:00:00.000Z`);
    if (filters.to) range.lte = new Date(`${filters.to}T23:59:59.999Z`);
    where.date = range;
  }

  return where;
}

async function registeredEventIds(userId: string | undefined, eventIds: string[]) {
  if (!userId || eventIds.length === 0) return new Set<string>();
  const registrations = await prisma.registration.findMany({
    where: { userId, eventId: { in: eventIds } },
    select: { eventId: true },
  });
  return new Set(registrations.map((registration) => registration.eventId));
}

export async function listEvents(
  filters: EventFilters,
  userId?: string,
): Promise<EventSummary[]> {
  const events = await prisma.event.findMany({
    where: buildWhere(filters),
    orderBy: { date: "asc" },
    include: withCount,
  });

  const registered = await registeredEventIds(
    userId,
    events.map((event) => event.id),
  );

  const summaries = events.map((event) =>
    toSummary(event, registered.has(event.id)),
  );

  return filters.available
    ? summaries.filter((event) => event.remaining > 0)
    : summaries;
}

export async function listPlaces(): Promise<string[]> {
  const rows = await prisma.event.findMany({
    distinct: ["place"],
    select: { place: true },
    orderBy: { place: "asc" },
  });
  return rows.map((row) => row.place);
}

export async function getEvent(id: string, userId?: string): Promise<EventSummary> {
  const event = await prisma.event.findUnique({
    where: { id },
    include: withCount,
  });
  if (!event) throw new AppError("NOT_FOUND", "Event not found");

  const registered = await registeredEventIds(userId, [event.id]);
  return toSummary(event, registered.has(event.id));
}

export async function listParticipants(eventId: string): Promise<Participant[]> {
  const registrations = await prisma.registration.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return registrations.map((registration) => ({
    id: registration.user.id,
    name: registration.user.name,
    email: registration.user.email,
    registeredAt: registration.createdAt,
  }));
}

export async function createEvent(input: EventInput): Promise<EventSummary> {
  const event = await prisma.event.create({ data: input, include: withCount });
  return toSummary(event, false);
}

export async function updateEvent(
  id: string,
  input: EventInput,
): Promise<EventSummary> {
  const existing = await prisma.event.findUnique({
    where: { id },
    include: withCount,
  });
  if (!existing) throw new AppError("NOT_FOUND", "Event not found");

  const registeredCount = existing._count.registrations;
  if (!canLowerCapacity(input.capacity, registeredCount)) {
    const message = `Capacity cannot be lower than the ${registeredCount} participants already registered`;
    throw new AppError("CAPACITY_BELOW_REGISTRATIONS", message, {
      capacity: message,
    });
  }

  const event = await prisma.event.update({
    where: { id },
    data: input,
    include: withCount,
  });
  return toSummary(event, false);
}

export async function deleteEvent(id: string): Promise<void> {
  const existing = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new AppError("NOT_FOUND", "Event not found");
  await prisma.event.delete({ where: { id } });
}

export async function registerForEvent(
  eventId: string,
  userId: string,
): Promise<EventSummary> {
  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE
    `;
    if (locked.length === 0) throw new AppError("NOT_FOUND", "Event not found");

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError(
        "UNAUTHENTICATED",
        "Your session is no longer valid, log in again",
      );
    }

    const event = await tx.event.findUniqueOrThrow({
      where: { id: eventId },
      include: withCount,
    });
    const existing = await tx.registration.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { id: true },
    });

    const refusal = checkRegistration({
      capacity: event.capacity,
      registeredCount: event._count.registrations,
      alreadyRegistered: existing !== null,
      eventDate: event.date,
      now: new Date(),
    });
    if (refusal) throw new AppError(refusal, refusalMessages[refusal]);

    await tx.registration.create({ data: { eventId, userId } });
  });

  return getEvent(eventId, userId);
}

export async function cancelRegistration(
  eventId: string,
  userId: string,
): Promise<EventSummary> {
  const result = await prisma.registration.deleteMany({
    where: { eventId, userId },
  });
  if (result.count === 0) {
    await getEvent(eventId);
    throw new AppError("NOT_REGISTERED", "You are not registered for this event");
  }
  return getEvent(eventId, userId);
}
