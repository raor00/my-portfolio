import { isSafeId } from "./config";

/**
 * The public aggregate JSON. Every key below is part of a reviewed allowlist:
 * dates, provider ids, model names, token counts, USD estimates, quota
 * percentages and the generation timestamp. Nothing else may appear.
 */
export interface QuotaWindow {
  label: string;
  usedPercent: number;
  resetsAt: string | null;
  windowSeconds: number;
}

export interface QuotaProvider {
  id: string;
  plan: string;
  status: "ok" | "stale" | "error";
  windows: QuotaWindow[];
  error: string | null;
}

export interface TokenmaxxingModel {
  provider: string;
  model: string;
  tokens: number;
  costUsd: number;
  lastUsed: string;
}

export interface TokenmaxxingDayModel {
  provider: string;
  model: string;
  tokens: number;
  costUsd: number;
}

export interface TokenmaxxingDay {
  date: string;
  providers: Record<string, { tokens: number; costUsd: number }>;
  /** Top models for the whole window, plus a single "other" bucket. */
  models: TokenmaxxingDayModel[];
}

export interface TokenmaxxingTotals {
  processedTokens: number;
  costUsd: number;
  cacheSavingsUsd: number;
  sessions: number;
  /** Claude usage whose day-level sources are gone: totals only, never a day. */
  undatedTokens: number;
  undatedCostUsd: number;
}

export interface TokenmaxxingOutput {
  generatedAt: string;
  timezone: string;
  /** Earliest known usage date across every source. */
  firstUsageDate: string;
  totals: TokenmaxxingTotals;
  days: TokenmaxxingDay[];
  models: TokenmaxxingModel[];
  quotas: QuotaProvider[];
  unpricedModels: string[];
}

export const OUTPUT_KEYS = [
  "generatedAt",
  "timezone",
  "firstUsageDate",
  "totals",
  "days",
  "models",
  "quotas",
  "unpricedModels",
] as const;

export const TOTALS_KEYS = [
  "processedTokens",
  "costUsd",
  "cacheSavingsUsd",
  "sessions",
  "undatedTokens",
  "undatedCostUsd",
] as const;
export const DAY_KEYS = ["date", "providers", "models"] as const;
export const DAY_PROVIDER_KEYS = ["tokens", "costUsd"] as const;
export const DAY_MODEL_KEYS = ["provider", "model", "tokens", "costUsd"] as const;
export const MODEL_KEYS = ["provider", "model", "tokens", "costUsd", "lastUsed"] as const;
export const QUOTA_KEYS = ["id", "plan", "status", "windows", "error"] as const;
export const QUOTA_WINDOW_KEYS = ["label", "usedPercent", "resetsAt", "windowSeconds"] as const;

/** Substrings that must never appear anywhere in the public file. */
export const FORBIDDEN_SUBSTRINGS = ["/Users/", "~/", "Bearer", "sk-", "eyJ"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function keysAre(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates the generated aggregate against the published schema.
 * Returns a list of human-readable violations; an empty list means safe.
 */
export function validateOutput(value: unknown): string[] {
  const violations: string[] = [];

  if (!isRecord(value)) return ["output is not an object"];
  if (!keysAre(value, OUTPUT_KEYS)) violations.push(`top-level keys mismatch: ${Object.keys(value).join(",")}`);
  if (typeof value.generatedAt !== "string" || !ISO_RE.test(value.generatedAt)) {
    violations.push("generatedAt is not an ISO timestamp");
  }
  if (typeof value.timezone !== "string" || value.timezone === "") violations.push("timezone missing");
  if (typeof value.firstUsageDate !== "string" || !DATE_RE.test(value.firstUsageDate)) {
    violations.push("firstUsageDate is not a date");
  }

  const totals = value.totals;
  if (!isRecord(totals) || !keysAre(totals, TOTALS_KEYS)) {
    violations.push("totals keys mismatch");
  } else {
    for (const key of TOTALS_KEYS) {
      if (typeof totals[key] !== "number" || !Number.isFinite(totals[key] as number)) {
        violations.push(`totals.${key} is not a number`);
      }
    }
    if ((totals.sessions as number) < 0) violations.push("totals.sessions is negative");
  }

  const days = value.days;
  if (!Array.isArray(days)) {
    violations.push("days is not an array");
  } else {
    for (const day of days) {
      if (!isRecord(day) || !keysAre(day, DAY_KEYS)) {
        violations.push("day keys mismatch");
        continue;
      }
      if (typeof day.date !== "string" || !DATE_RE.test(day.date)) violations.push(`bad day date: ${String(day.date)}`);
      const providers = day.providers;
      if (!isRecord(providers)) {
        violations.push("day.providers is not an object");
        continue;
      }
      for (const [provider, entry] of Object.entries(providers)) {
        if (!isSafeId(provider)) violations.push(`unsafe provider id: ${provider}`);
        if (!isRecord(entry) || !keysAre(entry, DAY_PROVIDER_KEYS)) {
          violations.push(`bad day provider entry for ${provider}`);
          continue;
        }
        if (typeof entry.tokens !== "number" || typeof entry.costUsd !== "number") {
          violations.push(`bad day provider numbers for ${provider}`);
        }
      }

      const dayModels = day.models;
      if (!Array.isArray(dayModels)) {
        violations.push("day.models is not an array");
        continue;
      }
      for (const dayModel of dayModels) {
        if (!isRecord(dayModel) || !keysAre(dayModel, DAY_MODEL_KEYS)) {
          violations.push("day model keys mismatch");
          continue;
        }
        if (typeof dayModel.provider !== "string" || !isSafeId(dayModel.provider)) {
          violations.push(`unsafe day model provider: ${String(dayModel.provider)}`);
        }
        if (typeof dayModel.model !== "string" || !isSafeId(dayModel.model)) {
          violations.push(`unsafe day model id: ${String(dayModel.model)}`);
        }
        if (typeof dayModel.tokens !== "number" || typeof dayModel.costUsd !== "number") {
          violations.push("bad day model numbers");
        }
      }
    }
  }

  const models = value.models;
  if (!Array.isArray(models)) {
    violations.push("models is not an array");
  } else {
    for (const model of models) {
      if (!isRecord(model) || !keysAre(model, MODEL_KEYS)) {
        violations.push("model keys mismatch");
        continue;
      }
      if (typeof model.provider !== "string" || !isSafeId(model.provider)) {
        violations.push(`unsafe model provider: ${String(model.provider)}`);
      }
      if (typeof model.model !== "string" || !isSafeId(model.model)) {
        violations.push(`unsafe model id: ${String(model.model)}`);
      }
      if (typeof model.tokens !== "number" || typeof model.costUsd !== "number") {
        violations.push("bad model numbers");
      }
      if (typeof model.lastUsed !== "string" || !DATE_RE.test(model.lastUsed)) {
        violations.push(`bad model lastUsed: ${String(model.lastUsed)}`);
      }
    }
  }

  const quotas = value.quotas;
  if (!Array.isArray(quotas)) {
    violations.push("quotas is not an array");
  } else {
    for (const quota of quotas) {
      if (!isRecord(quota) || !keysAre(quota, QUOTA_KEYS)) {
        violations.push("quota keys mismatch");
        continue;
      }
      if (typeof quota.id !== "string" || !isSafeId(quota.id)) violations.push(`unsafe quota id: ${String(quota.id)}`);
      if (typeof quota.plan !== "string") violations.push("quota plan is not a string");
      if (!["ok", "stale", "error"].includes(String(quota.status))) violations.push(`bad quota status: ${String(quota.status)}`);
      if (quota.error !== null && typeof quota.error !== "string") violations.push("quota error is not null|string");
      if (typeof quota.error === "string" && !isSafeId(quota.error)) {
        violations.push(`unsafe quota error code: ${quota.error}`);
      }
      if (!Array.isArray(quota.windows)) {
        violations.push("quota windows is not an array");
        continue;
      }
      for (const window of quota.windows) {
        if (!isRecord(window) || !keysAre(window, QUOTA_WINDOW_KEYS)) {
          violations.push("quota window keys mismatch");
          continue;
        }
        if (typeof window.label !== "string" || !isSafeId(window.label)) violations.push("bad window label");
        const percent = window.usedPercent;
        if (typeof percent !== "number" || percent < 0 || percent > 100) violations.push("usedPercent out of range");
        if (window.resetsAt !== null && (typeof window.resetsAt !== "string" || !ISO_RE.test(window.resetsAt))) {
          violations.push("bad resetsAt");
        }
        if (typeof window.windowSeconds !== "number" || window.windowSeconds < 0) violations.push("bad windowSeconds");
      }
    }
  }

  const unpriced = value.unpricedModels;
  if (!Array.isArray(unpriced)) {
    violations.push("unpricedModels is not an array");
  } else {
    for (const entry of unpriced) {
      if (typeof entry !== "string" || !isSafeId(entry)) violations.push(`unsafe unpriced model: ${String(entry)}`);
    }
  }

  const serialized = JSON.stringify(value);
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    if (serialized.includes(forbidden)) violations.push(`forbidden substring: ${forbidden}`);
  }

  return violations;
}
