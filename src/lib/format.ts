const timeZone = "Africa/Casablanca";

const eventDateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone,
});

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone });

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone });

const inputFormat = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone,
});

export function formatEventDate(date: Date) {
  return eventDateFormat.format(date);
}

export function formatDay(date: Date) {
  return dayFormat.format(date);
}

export function formatMonth(date: Date) {
  return monthFormat.format(date);
}

export function toDateTimeInput(date: Date) {
  return inputFormat.format(date).replace(" ", "T");
}
