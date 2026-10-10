import { describe, expect, it } from "vitest";
import {
  eventFiltersSchema,
  eventSchema,
  fieldErrors,
  signUpSchema,
} from "./validation";

const validEvent = {
  title: "Startup Pitch Night",
  description: "Ten student teams pitch their project to a jury.",
  date: "2026-11-05T17:00:00.000Z",
  place: "Benguerir",
  capacity: 80,
};

function errorsFor(input: unknown) {
  const result = eventSchema.safeParse(input);
  return result.success ? {} : fieldErrors(result.error);
}

describe("eventSchema", () => {
  it("accepts a valid event and converts the date", () => {
    const result = eventSchema.parse(validEvent);
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.toISOString()).toBe(validEvent.date);
  });

  it("accepts a capacity sent as text by a form", () => {
    expect(eventSchema.parse({ ...validEvent, capacity: "25" }).capacity).toBe(25);
  });

  it("trims the title", () => {
    expect(eventSchema.parse({ ...validEvent, title: "  Pitch  " }).title).toBe(
      "Pitch",
    );
  });

  it("refuses an empty title", () => {
    expect(errorsFor({ ...validEvent, title: "" })).toHaveProperty("title");
  });

  it("refuses a capacity of zero", () => {
    expect(errorsFor({ ...validEvent, capacity: 0 })).toHaveProperty("capacity");
  });

  it("refuses a capacity that is not a whole number", () => {
    expect(errorsFor({ ...validEvent, capacity: 2.5 })).toHaveProperty("capacity");
  });

  it("refuses an invalid date", () => {
    expect(errorsFor({ ...validEvent, date: "not a date" })).toHaveProperty("date");
  });

  it("refuses a missing date", () => {
    expect(errorsFor({ ...validEvent, date: "" })).toHaveProperty("date");
    expect(errorsFor({ ...validEvent, date: null })).toHaveProperty("date");
  });

  it("reports every invalid field at once", () => {
    expect(Object.keys(errorsFor({})).sort()).toEqual([
      "capacity",
      "date",
      "description",
      "place",
      "title",
    ]);
  });
});

describe("signUpSchema", () => {
  const validUser = {
    name: "Yassir",
    email: "  Yassir@Example.com ",
    password: "a-long-password",
  };

  it("normalises the email", () => {
    expect(signUpSchema.parse(validUser).email).toBe("yassir@example.com");
  });

  it("refuses a short password", () => {
    expect(signUpSchema.safeParse({ ...validUser, password: "short" }).success).toBe(
      false,
    );
  });

  it("refuses an invalid email", () => {
    expect(signUpSchema.safeParse({ ...validUser, email: "nope" }).success).toBe(
      false,
    );
  });
});

describe("eventFiltersSchema", () => {
  it("returns no filter for an empty query", () => {
    expect(eventFiltersSchema.parse({})).toEqual({
      q: undefined,
      place: undefined,
      from: undefined,
      to: undefined,
      available: false,
    });
  });

  it("reads every filter", () => {
    expect(
      eventFiltersSchema.parse({
        q: " pitch ",
        place: "Rabat",
        from: "2026-10-01",
        to: "2026-10-31",
        available: "1",
      }),
    ).toEqual({
      q: "pitch",
      place: "Rabat",
      from: "2026-10-01",
      to: "2026-10-31",
      available: true,
    });
  });

  it("ignores a badly formatted day", () => {
    expect(eventFiltersSchema.parse({ from: "yesterday" }).from).toBeUndefined();
  });
});
