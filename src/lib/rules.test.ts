import { describe, expect, it } from "vitest";
import {
  canLowerCapacity,
  checkRegistration,
  isFull,
  isPast,
  remainingPlaces,
} from "./rules";

const now = new Date("2026-10-09T12:00:00.000Z");
const tomorrow = new Date("2026-10-10T12:00:00.000Z");
const yesterday = new Date("2026-10-08T12:00:00.000Z");

const open = {
  capacity: 10,
  registeredCount: 4,
  alreadyRegistered: false,
  eventDate: tomorrow,
  now,
};

describe("remainingPlaces", () => {
  it("subtracts the registrations from the capacity", () => {
    expect(remainingPlaces(10, 4)).toBe(6);
  });

  it("never goes below zero", () => {
    expect(remainingPlaces(10, 12)).toBe(0);
  });
});

describe("isFull", () => {
  it("is false while places remain", () => {
    expect(isFull(10, 9)).toBe(false);
  });

  it("is true when the capacity is reached", () => {
    expect(isFull(10, 10)).toBe(true);
  });
});

describe("isPast", () => {
  it("is true for a date before now", () => {
    expect(isPast(yesterday, now)).toBe(true);
  });

  it("is false for a date after now", () => {
    expect(isPast(tomorrow, now)).toBe(false);
  });
});

describe("checkRegistration", () => {
  it("accepts a registration when places remain", () => {
    expect(checkRegistration(open)).toBeNull();
  });

  it("accepts the last remaining place", () => {
    expect(checkRegistration({ ...open, registeredCount: 9 })).toBeNull();
  });

  it("refuses when the event is full", () => {
    expect(checkRegistration({ ...open, registeredCount: 10 })).toBe("EVENT_FULL");
  });

  it("refuses a second registration by the same user", () => {
    expect(checkRegistration({ ...open, alreadyRegistered: true })).toBe(
      "ALREADY_REGISTERED",
    );
  });

  it("refuses when the event has already taken place", () => {
    expect(checkRegistration({ ...open, eventDate: yesterday })).toBe(
      "EVENT_PASSED",
    );
  });
});

describe("canLowerCapacity", () => {
  it("allows a capacity equal to the registrations", () => {
    expect(canLowerCapacity(4, 4)).toBe(true);
  });

  it("refuses a capacity below the registrations", () => {
    expect(canLowerCapacity(3, 4)).toBe(false);
  });
});
