/**
 * Formats an ISO date from the API. Delivery dates are plain days stored at
 * 00:00 UTC, so they are shown in UTC and never slide to the previous day;
 * with `withTime` the browser's local time zone is used instead.
 */
export function formatDate(value: string, withTime = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: withTime ? undefined : "UTC",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
