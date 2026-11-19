import { describe, expect, test } from "bun:test";
import { normalizeResetAt, toUsageDate, toIsoTimestamp } from "./time";

describe("normalizeResetAt", () => {
  test("treats a value above 1e10 as epoch milliseconds", () => {
    expect(normalizeResetAt(1_700_000_000_000)).toBe(new Date(1_700_000_000_000).toISOString());
  });

  test("treats a value at or below 1e10 as epoch seconds", () => {
    expect(normalizeResetAt(1_700_000_000)).toBe(new Date(1_700_000_000_000).toISOString());
  });

  test("numeric strings follow the same rule", () => {
    expect(normalizeResetAt("1700000000")).toBe(new Date(1_700_000_000_000).toISOString());
    expect(normalizeResetAt("1700000000000")).toBe(new Date(1_700_000_000_000).toISOString());
  });

  test("ISO strings are parsed", () => {
    expect(normalizeResetAt("2026-01-02T03:04:05.000Z")).toBe("2026-01-02T03:04:05.000Z");
    expect(normalizeResetAt("2026-01-02T03:04:05Z")).toBe("2026-01-02T03:04:05.000Z");
  });

  test("null, empty and invalid values collapse to null", () => {
    expect(normalizeResetAt(null)).toBeNull();
    expect(normalizeResetAt(undefined)).toBeNull();
    expect(normalizeResetAt("")).toBeNull();
    expect(normalizeResetAt("not-a-date")).toBeNull();
    expect(normalizeResetAt(0)).toBeNull();
    expect(normalizeResetAt(-5)).toBeNull();
    expect(normalizeResetAt(Number.NaN)).toBeNull();
  });
});

describe("toUsageDate", () => {
  test("returns the local calendar day, not the UTC one", () => {
    const iso = "2024-03-10T02:30:00.000Z";
    const local = toUsageDate(iso);
    expect(/^\d{4}-\d{2}-\d{2}$/.test(local)).toBe(true);
    const date = new Date(iso);
    const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));
    expect(local).toBe(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  });

  test("keeps the local day when UTC has already rolled over", () => {
    const script = `import { toUsageDate } from ${JSON.stringify(import.meta.dir + "/time.ts")}; console.log(toUsageDate("2024-03-10T02:30:00.000Z"));`;
    const proc = Bun.spawnSync({
      cmd: [process.execPath, "-e", script],
      env: { ...process.env, TZ: "America/Caracas" },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(proc.stderr.toString()).toBe("");
    // 02:30 UTC is 22:30 of the PREVIOUS day in Caracas (UTC-4).
    expect(proc.stdout.toString().trim()).toBe("2024-03-09");
  });

  test("same instant in UTC keeps the UTC day", () => {
    const script = `import { toUsageDate } from ${JSON.stringify(import.meta.dir + "/time.ts")}; console.log(toUsageDate("2024-03-10T02:30:00.000Z"));`;
    const proc = Bun.spawnSync({
      cmd: [process.execPath, "-e", script],
      env: { ...process.env, TZ: "UTC" },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(proc.stdout.toString().trim()).toBe("2024-03-10");
  });
});

describe("toIsoTimestamp", () => {
  test("normalizes to UTC ISO and rejects invalid input", () => {
    expect(toIsoTimestamp(1_700_000_000_000)).toBe("2023-11-14T22:13:20.000Z");
    expect(toIsoTimestamp("2024-01-01T00:00:00Z")).toBe("2024-01-01T00:00:00.000Z");
    expect(toIsoTimestamp("nope")).toBe("");
  });
});
