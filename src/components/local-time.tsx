"use client";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const absolute = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** "just now", "5 minutes ago", "yesterday", or a date for older times. */
export const formatWhen = (date: Date, now = Date.now()) => {
  const diff = date.getTime() - now;
  const abs = Math.abs(diff);
  if (abs < MINUTE) {
    return "just now";
  }
  if (abs < HOUR) {
    return relative.format(Math.round(diff / MINUTE), "minute");
  }
  if (abs < DAY) {
    return relative.format(Math.round(diff / HOUR), "hour");
  }
  if (abs < 7 * DAY) {
    return relative.format(Math.round(diff / DAY), "day");
  }
  return absolute.format(date);
};

/**
 * Renders a time in the viewer's own time zone. The server renders in UTC, so
 * the first paint may differ by a few characters; that's expected.
 */
export const LocalTime = ({ date }: { date: Date | string }) => {
  const value = typeof date === "string" ? new Date(date) : date;
  return (
    <time
      dateTime={value.toISOString()}
      suppressHydrationWarning
      title={absolute.format(value)}
    >
      {formatWhen(value)}
    </time>
  );
};
