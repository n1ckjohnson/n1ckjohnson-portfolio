/**
 * The time of day in a named place, as a visitor anywhere would read it on
 * a clock there.
 *
 * The zone is an IANA name ("America/New_York"), never a fixed offset, so
 * daylight saving is applied by the platform's own time-zone data and the
 * answer does not depend on where the visitor is.
 *
 * Pure: the same instant and zone always give the same parts. Covered by
 * time.test.ts.
 */

export type ClockParts = {
  /** 1 to 12, without a leading zero. */
  hour: string;
  /** Always two digits. */
  minute: string;
  period: "AM" | "PM";
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

export function clockParts(instant: Date, timeZone: string): ClockParts {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    hour: String(Number(read("hour"))),
    minute: read("minute").padStart(2, "0"),
    period: read("dayPeriod").toUpperCase().startsWith("P") ? "PM" : "AM",
  };
}

/** "8:53 PM" */
export function clockText(parts: ClockParts) {
  return `${parts.hour}:${parts.minute} ${parts.period}`;
}

/** Milliseconds from `now` until the next minute begins. */
export function untilNextMinute(now: number) {
  return 60_000 - (now % 60_000);
}
