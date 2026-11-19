/**
 * Time helpers shared by the collector and the aggregator.
 * Timestamps are stored in UTC ISO; usage_date is the LOCAL calendar day.
 */

const MS_THRESHOLD = 1e10;

function toIso(ms: number): string | null {
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Normalizes provider reset timestamps: epoch ms when the value is > 1e10,
 * epoch seconds otherwise, numeric strings the same way, everything else via
 * Date.parse. Returns ISO-8601 or null.
 */
export function normalizeResetAt(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return toIso(value > MS_THRESHOLD ? value : value * 1000);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return normalizeResetAt(Number(trimmed));
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  }

  return null;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function isValidTimestamp(value: unknown): value is string | number {
  return (typeof value === "string" && value.trim() !== "") || (typeof value === "number" && Number.isFinite(value));
}

/** Local calendar day (YYYY-MM-DD) for a timestamp, or "" when unparseable. */
export function toUsageDate(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const ms = date.getTime();
  if (Number.isNaN(ms)) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** UTC ISO string for a timestamp, or "" when unparseable. */
export function toIsoTimestamp(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const ms = date.getTime();
  return Number.isNaN(ms) ? "" : new Date(ms).toISOString();
}

/** Local IANA timezone of this machine, for the public JSON metadata. */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
