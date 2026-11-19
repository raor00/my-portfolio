import { isSafeId } from "./config";

/**
 * The public aggregate JSON. Every key below is part of a reviewed allowlist:
 * dates, provider ids, provider labels, model names, token counts, USD
 * estimates, quota percentages and the generation timestamp. Nothing else may
 * appear.
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

export interface TokenSplit {
  cachedInput: number;
  uncachedInput: number;
  output: number;
}

export interface TokenmaxxingModel {
  provider: string;
  model: string;
  tokens: number;
  costUsd: number;
  lastUsed: string;
}

export interface TokenmaxxingDayProvider extends TokenSplit {
  tokens: number;
  costUsd: number;
}

export interface TokenmaxxingDayModel extends TokenSplit {
  provider: string;
  model: string;
  tokens: number;
  costUsd: number;
}

export interface TokenmaxxingDay extends TokenSplit {
  date: string;
  providers: Record<string, TokenmaxxingDayProvider>;
  /** Top models for the whole window, plus a single "other" bucket. */
  models: TokenmaxxingDayModel[];
}

export interface TokenmaxxingTotals extends TokenSplit {
  processedTokens: number;
  costUsd: number;
  cacheSavingsUsd: number;
  sessions: number;
  /** Claude usage whose day-level sources are gone: totals only, never a day. */
  undatedTokens: number;
  undatedCostUsd: number;
}

export interface BreakdownProvider extends TokenSplit {
  provider: string;
  label: string;
  sessions: number;
  tokens: number;
  costUsd: number;
}

export interface BreakdownModel extends TokenSplit {
  provider: string;
  label: string;
  model: string;
  sessions: number;
  tokens: number;
  costUsd: number;
  lastUsed: string;
}

export interface BreakdownWindow {
  providers: BreakdownProvider[];
  models: BreakdownModel[];
}

export type Breakdowns = Record<string, BreakdownWindow>;

export interface TokenmaxxingOutput {
  generatedAt: string;
  timezone: string;
  /** Earliest known usage date across every source. */
  firstUsageDate: string;
  totals: TokenmaxxingTotals;
  days: TokenmaxxingDay[];
  models: TokenmaxxingModel[];
  breakdowns: Breakdowns;
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
  "breakdowns",
  "quotas",
  "unpricedModels",
] as const;

export const TOTALS_KEYS = [
  "processedTokens",
  "cachedInput",
  "uncachedInput",
  "output",
  "costUsd",
  "cacheSavingsUsd",
  "sessions",
  "undatedTokens",
  "undatedCostUsd",
] as const;

export const DAY_KEYS = ["date", "cachedInput", "uncachedInput", "output", "providers", "models"] as const;
export const DAY_PROVIDER_KEYS = ["tokens", "cachedInput", "uncachedInput", "output", "costUsd"] as const;
export const DAY_MODEL_KEYS = ["provider", "model", "tokens", "cachedInput", "uncachedInput", "output", "costUsd"] as const;
export const MODEL_KEYS = ["provider", "model", "tokens", "costUsd", "lastUsed"] as const;
export const QUOTA_KEYS = ["id", "plan", "status", "windows", "error"] as const;
export const QUOTA_WINDOW_KEYS = ["label", "usedPercent", "resetsAt", "windowSeconds"] as const;
export const BREAKDOWN_WINDOW_KEYS = ["providers", "models"] as const;
export const BREAKDOWN_PROVIDER_KEYS = [
  "provider",
  "label",
  "sessions",
  "tokens",
  "cachedInput",
  "uncachedInput",
  "output",
  "costUsd",
] as const;
export const BREAKDOWN_MODEL_KEYS = [
  "provider",
  "label",
  "model",
  "sessions",
  "tokens",
  "cachedInput",
  "uncachedInput",
  "output",
  "costUsd",
  "lastUsed",
] as const;

export const BREAKDOWN_WINDOW_NAMES = ["7", "30", "90", "365", "all"] as const;

/** Substrings that must never appear anywhere in the public file. */
export const FORBIDDEN_SUBSTRINGS = ["/Users/", "~/", "Bearer", "sk-", "eyJ", "@gmail", "@hotmail", "@outlook"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
/** Display labels may contain spaces and dots but never path characters. */
const LABEL_RE = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,31}$/;

function keysAre(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function checkSplit(
  entry: Record<string, unknown>,
  violations: string[],
  context: string,
  tokensKey: string | null,
): void {
  const { cachedInput, uncachedInput, output } = entry;
  if (!isNumber(cachedInput) || !isNumber(uncachedInput) || !isNumber(output)) {
    violations.push(`${context} split is not numeric`);
    return;
  }
  if (cachedInput < 0 || uncachedInput < 0 || output < 0) violations.push(`${context} split is negative`);
  if (tokensKey) {
    const tokens = entry[tokensKey];
    if (isNumber(tokens) && cachedInput + uncachedInput + output !== tokens) {
      violations.push(`${context} split does not sum to tokens`);
    }
  }
}

function checkLabel(entry: Record<string, unknown>, violations: string[], context: string): void {
  if (typeof entry.label !== "string" || !LABEL_RE.test(entry.label)) {
    violations.push(`${context} label is unsafe`);
  }
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
      if (!isNumber(totals[key])) violations.push(`totals.${key} is not a number`);
    }
    if ((totals.sessions as number) < 0) violations.push("totals.sessions is negative");
    checkSplit(totals, violations, "totals", "processedTokens");
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
      checkSplit(day, violations, "day", null);

      const providers = day.providers;
      if (!isRecord(providers)) {
        violations.push("day.providers is not an object");
      } else {
        for (const [provider, entry] of Object.entries(providers)) {
          if (!isSafeId(provider)) violations.push(`unsafe provider id: ${provider}`);
          if (!isRecord(entry) || !keysAre(entry, DAY_PROVIDER_KEYS)) {
            violations.push(`bad day provider entry for ${provider}`);
            continue;
          }
          if (!isNumber(entry.tokens) || !isNumber(entry.costUsd)) {
            violations.push(`bad day provider numbers for ${provider}`);
          }
          checkSplit(entry, violations, `day provider ${provider}`, "tokens");
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
        if (!isNumber(dayModel.tokens) || !isNumber(dayModel.costUsd)) violations.push("bad day model numbers");
        checkSplit(dayModel, violations, "day model", "tokens");
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
      if (!isNumber(model.tokens) || !isNumber(model.costUsd)) violations.push("bad model numbers");
      if (typeof model.lastUsed !== "string" || !DATE_RE.test(model.lastUsed)) {
        violations.push(`bad model lastUsed: ${String(model.lastUsed)}`);
      }
    }
  }

  const breakdowns = value.breakdowns;
  if (!isRecord(breakdowns)) {
    violations.push("breakdowns is not an object");
  } else {
    if (!keysAre(breakdowns, BREAKDOWN_WINDOW_NAMES)) {
      violations.push(`breakdown windows mismatch: ${Object.keys(breakdowns).join(",")}`);
    }
    for (const [windowName, window] of Object.entries(breakdowns)) {
      if (!isRecord(window) || !keysAre(window, BREAKDOWN_WINDOW_KEYS)) {
        violations.push(`breakdown ${windowName} keys mismatch`);
        continue;
      }
      const providers = window.providers;
      const windowModels = window.models;
      if (!Array.isArray(providers) || !Array.isArray(windowModels)) {
        violations.push(`breakdown ${windowName} arrays missing`);
        continue;
      }
      for (const entry of providers) {
        if (!isRecord(entry) || !keysAre(entry, BREAKDOWN_PROVIDER_KEYS)) {
          violations.push(`breakdown ${windowName} provider keys mismatch`);
          continue;
        }
        if (typeof entry.provider !== "string" || !isSafeId(entry.provider)) {
          violations.push(`breakdown ${windowName} unsafe provider id`);
        }
        checkLabel(entry, violations, `breakdown ${windowName} provider ${String(entry.provider)}`);
        if (!isNumber(entry.sessions) || !isNumber(entry.tokens) || !isNumber(entry.costUsd)) {
          violations.push(`breakdown ${windowName} provider numbers`);
        }
        checkSplit(entry, violations, `breakdown ${windowName} provider ${String(entry.provider)}`, "tokens");
      }
      for (const entry of windowModels) {
        if (!isRecord(entry) || !keysAre(entry, BREAKDOWN_MODEL_KEYS)) {
          violations.push(`breakdown ${windowName} model keys mismatch`);
          continue;
        }
        if (typeof entry.provider !== "string" || !isSafeId(entry.provider)) {
          violations.push(`breakdown ${windowName} unsafe model provider id`);
        }
        if (typeof entry.model !== "string" || !isSafeId(entry.model)) {
          violations.push(`breakdown ${windowName} unsafe model id`);
        }
        checkLabel(entry, violations, `breakdown ${windowName} model ${String(entry.model)}`);
        if (!isNumber(entry.sessions) || !isNumber(entry.tokens) || !isNumber(entry.costUsd)) {
          violations.push(`breakdown ${windowName} model numbers`);
        }
        if (typeof entry.lastUsed !== "string" || !DATE_RE.test(entry.lastUsed)) {
          violations.push(`breakdown ${windowName} model lastUsed`);
        }
        checkSplit(entry, violations, `breakdown ${windowName} model ${String(entry.model)}`, "tokens");
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
