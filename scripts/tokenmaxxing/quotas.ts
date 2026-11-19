import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { COOLDOWNS_PATH, SOURCES } from "./config";
import { normalizeResetAt } from "./time";
import type { QuotaProvider, QuotaWindow } from "./sanitize";

/**
 * Quota probing.
 *
 * Every credential read here is read-only and stays inside this module: tokens
 * are never logged, never returned and never compared with anything but their
 * SHA-256. No OAuth refresh endpoint is ever called.
 */

export type QuotaStatus = "ok" | "stale" | "error";

export interface Credential {
  token: string;
  /** Epoch milliseconds, or null when the provider does not expose expiry. */
  expiresAt: number | null;
  /** Non-secret plan/subscription hint. */
  plan: string;
  /** Non-secret extras (e.g. ChatGPT account id) used in headers. */
  meta: Record<string, string>;
}

export interface CredentialSource {
  /** Returns the credential or null; must never throw with secret content. */
  read: () => Promise<Credential | null>;
}

const FIVE_HOURS = 18_000;
const SEVEN_DAYS = 604_800;
const THIRTY_DAYS = 2_592_000;
const MIN_COOLDOWN_MS = 15 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function clampPercent(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
}

function windowLabel(seconds: number): string {
  if (seconds === FIVE_HOURS) return "5h";
  if (seconds === SEVEN_DAYS) return "7d";
  if (seconds === THIRTY_DAYS) return "30d";
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function makeWindow(label: string, windowSeconds: number, usedPercent: unknown, resetsAt: unknown): QuotaWindow {
  return {
    label,
    usedPercent: clampPercent(usedPercent),
    resetsAt: normalizeResetAt(resetsAt),
    windowSeconds,
  };
}

/** Anthropic oauth usage response. */
export function mapClaudeQuota(json: unknown): { plan: string; windows: QuotaWindow[] } | null {
  if (typeof json !== "object" || json === null) return null;
  const body = json as Record<string, unknown>;
  const windows: QuotaWindow[] = [];

  const fiveHour = body.five_hour as Record<string, unknown> | undefined;
  if (fiveHour) {
    windows.push(
      makeWindow("5h", FIVE_HOURS, fiveHour.utilization ?? fiveHour.used_percentage, fiveHour.resets_at),
    );
  }

  const sevenDay = body.seven_day as Record<string, unknown> | undefined;
  if (sevenDay) {
    windows.push(
      makeWindow("7d", SEVEN_DAYS, sevenDay.utilization ?? sevenDay.used_percentage, sevenDay.resets_at),
    );
  }

  const plan = typeof body.plan === "string" ? body.plan : typeof body.subscription_type === "string" ? body.subscription_type : "";
  if (windows.length === 0) return null;
  return { plan, windows };
}

/** ChatGPT/codex wham usage response. */
export function mapCodexQuota(json: unknown): { plan: string; windows: QuotaWindow[] } | null {
  if (typeof json !== "object" || json === null) return null;
  const body = json as Record<string, unknown>;
  const rateLimit = body.rate_limit as Record<string, unknown> | undefined;

  const windows: QuotaWindow[] = [];
  const pushWindow = (raw: unknown): void => {
    if (typeof raw !== "object" || raw === null) return;
    const entry = raw as Record<string, unknown>;
    const seconds = Number(entry.limit_window_seconds) || FIVE_HOURS;
    windows.push(makeWindow(windowLabel(seconds), seconds, entry.used_percent, entry.reset_at));
  };
  pushWindow(rateLimit?.primary_window);
  pushWindow(rateLimit?.secondary_window);

  const plan = typeof body.plan_type === "string" ? body.plan_type : "";
  if (windows.length === 0) return null;
  return { plan, windows };
}

/** opencode zen go usage response. */
export function mapOpencodeQuota(json: unknown): { plan: string; windows: QuotaWindow[] } | null {
  if (typeof json !== "object" || json === null) return null;
  const body = json as Record<string, unknown>;
  const usage = body.usage as Record<string, unknown> | undefined;
  if (!usage) return null;

  const windows: QuotaWindow[] = [];
  const add = (key: string, label: string, seconds: number): void => {
    const entry = usage[key];
    if (typeof entry !== "object" || entry === null) return;
    const record = entry as Record<string, unknown>;
    windows.push(makeWindow(label, seconds, record.percent, record.resetsAt));
  };
  add("rolling", windowLabel(FIVE_HOURS), FIVE_HOURS);
  add("weekly", windowLabel(SEVEN_DAYS), SEVEN_DAYS);
  add("monthly", windowLabel(THIRTY_DAYS), THIRTY_DAYS);

  const plan = typeof body.plan === "string" ? body.plan : "";
  if (windows.length === 0) return null;
  return { plan, windows };
}

function collectTokenLimits(value: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const entry of value) collectTokenLimits(entry, out);
    return;
  }
  if (typeof value !== "object" || value === null) return;
  const record = value as Record<string, unknown>;
  if (record.type === "TOKENS_LIMIT" && Number(record.unit) === 3) out.push(record);
  for (const child of Object.values(record)) collectTokenLimits(child, out);
}

/** Z.ai monitor quota response. */
export function mapZaiQuota(json: unknown): { plan: string; windows: QuotaWindow[] } | null {
  if (typeof json !== "object" || json === null) return null;
  const body = json as Record<string, unknown>;
  const data = body.data as Record<string, unknown> | undefined;

  const entries: Record<string, unknown>[] = [];
  collectTokenLimits(body, entries);
  const tokenLimit = entries[0];
  if (!tokenLimit) return null;

  const windows = [
    makeWindow(windowLabel(FIVE_HOURS), FIVE_HOURS, tokenLimit.percentage, tokenLimit.nextResetTime),
  ];
  const plan = typeof data?.level === "string" ? data.level : "";
  return { plan, windows };
}

interface ProviderDefinition {
  id: string;
  planFallback: string;
  request: (credential: Credential) => { url: string; headers: Record<string, string> };
  parse: (json: unknown) => { plan: string; windows: QuotaWindow[] } | null;
}

function claudeRequest(credential: Credential): { url: string; headers: Record<string, string> } {
  return {
    url: "https://api.anthropic.com/api/oauth/usage",
    headers: {
      Authorization: `Bearer ${credential.token}`,
      "anthropic-beta": "oauth-2025-04-20",
      "User-Agent": "claude-code/2.1.0",
    },
  };
}

function codexRequest(credential: Credential): { url: string; headers: Record<string, string> } {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${credential.token}`,
    "User-Agent": "codex-cli",
    "OpenAI-Beta": "codex-1",
    originator: "Codex Desktop",
  };
  const accountId = credential.meta.accountId;
  if (accountId) headers["ChatGPT-Account-Id"] = accountId;
  return { url: "https://chatgpt.com/backend-api/wham/usage", headers };
}

function opencodeRequest(credential: Credential): { url: string; headers: Record<string, string> } {
  return {
    url: "https://opencode.ai/zen/go/v1/usage",
    headers: { Authorization: `Bearer ${credential.token}` },
  };
}

function zaiRequest(credential: Credential): { url: string; headers: Record<string, string> } {
  return {
    url: "https://api.z.ai/api/monitor/usage/quota/limit",
    headers: { Authorization: `Bearer ${credential.token}` },
  };
}

const PROVIDERS: ProviderDefinition[] = [
  { id: "claude", planFallback: "", request: claudeRequest, parse: mapClaudeQuota },
  { id: "codex", planFallback: "", request: codexRequest, parse: mapCodexQuota },
  { id: "opencode-go", planFallback: "", request: opencodeRequest, parse: mapOpencodeQuota },
  { id: "zai", planFallback: "", request: zaiRequest, parse: mapZaiQuota },
];

function readJsonFile(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function jwtExpiry(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
    const exp = Number(payload.exp);
    return Number.isFinite(exp) && exp > 0 ? exp * 1000 : null;
  } catch {
    return null;
  }
}

async function claudeCredential(): Promise<Credential | null> {
  const candidates: { token: string; expiresAt: number | null; plan: string }[] = [];

  try {
    const proc = Bun.spawnSync({
      cmd: ["security", "find-generic-password", "-s", "Claude Code-credentials", "-w"],
      stdout: "pipe",
      stderr: "ignore",
    });
    if (proc.exitCode === 0) {
      const parsed = JSON.parse(proc.stdout.toString()) as Record<string, unknown>;
      const oauth = parsed.claudeAiOauth as Record<string, unknown> | undefined;
      if (oauth && typeof oauth.accessToken === "string") {
        candidates.push({
          token: oauth.accessToken,
          expiresAt: typeof oauth.expiresAt === "number" ? oauth.expiresAt : null,
          plan: typeof oauth.subscriptionType === "string" ? oauth.subscriptionType : "",
        });
      }
    }
  } catch {
    // Keychain unavailable; fall back to the file copy.
  }

  const file = readJsonFile(SOURCES.claudeCredentialsFile);
  const fileOauth = file?.claudeAiOauth as Record<string, unknown> | undefined;
  if (fileOauth && typeof fileOauth.accessToken === "string") {
    candidates.push({
      token: fileOauth.accessToken,
      expiresAt: typeof fileOauth.expiresAt === "number" ? fileOauth.expiresAt : null,
      plan: typeof fileOauth.subscriptionType === "string" ? fileOauth.subscriptionType : "",
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (b.expiresAt ?? 0) - (a.expiresAt ?? 0));
  const best = candidates[0];
  return { token: best.token, expiresAt: best.expiresAt, plan: best.plan, meta: {} };
}

async function codexCredential(): Promise<Credential | null> {
  const auth = readJsonFile(SOURCES.codexAuthFile);
  const tokens = auth?.tokens as Record<string, unknown> | undefined;
  if (!tokens || typeof tokens.access_token !== "string") return null;
  const accountId = typeof tokens.account_id === "string" ? tokens.account_id : "";
  return {
    token: tokens.access_token,
    expiresAt: jwtExpiry(tokens.access_token),
    plan: "",
    meta: { accountId },
  };
}

async function opencodeCredential(): Promise<Credential | null> {
  if (!existsSync(SOURCES.opencodeDb)) return null;
  let db: Database | null = null;
  try {
    db = new Database(SOURCES.opencodeDb, { readonly: true });
    const rows = db
      .prepare("SELECT value FROM credential WHERE integration_id = 'opencode' ORDER BY time_updated DESC")
      .all() as { value: string }[];
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.value) as Record<string, unknown>;
        if (parsed.type !== "oauth") continue;
        if (typeof parsed.access !== "string") continue;
        return {
          token: parsed.access,
          expiresAt: typeof parsed.expires === "number" ? parsed.expires : null,
          plan: "",
          meta: {},
        };
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

async function zaiCredential(): Promise<Credential | null> {
  const auth = readJsonFile(SOURCES.opencodeAuthFile);
  const entry = auth?.["zai-coding-plan"] as Record<string, unknown> | undefined;
  if (!entry || typeof entry.key !== "string" || entry.key === "") return null;
  return { token: entry.key, expiresAt: null, plan: "", meta: {} };
}

const CREDENTIAL_SOURCES: Record<string, CredentialSource> = {
  claude: { read: claudeCredential },
  codex: { read: codexCredential },
  "opencode-go": { read: opencodeCredential },
  zai: { read: zaiCredential },
};

export interface CooldownState {
  blocked: string[];
  cooldownUntil: Record<string, number>;
}

export function readCooldowns(path: string = COOLDOWNS_PATH): CooldownState {
  if (!existsSync(path)) return { blocked: [], cooldownUntil: {} };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<CooldownState>;
    return {
      blocked: Array.isArray(parsed.blocked) ? parsed.blocked.filter((entry) => typeof entry === "string") : [],
      cooldownUntil:
        typeof parsed.cooldownUntil === "object" && parsed.cooldownUntil !== null ? parsed.cooldownUntil : {},
    };
  } catch {
    return { blocked: [], cooldownUntil: {} };
  }
}

export function writeCooldowns(state: CooldownState, path: string = COOLDOWNS_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state), { mode: 0o600 });
}

function retryAfterMs(headers: Headers): number {
  const raw = headers.get("retry-after");
  if (!raw) return MIN_COOLDOWN_MS;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return Math.max(numeric * 1000, MIN_COOLDOWN_MS);
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return Math.max(parsed - Date.now(), MIN_COOLDOWN_MS);
  return MIN_COOLDOWN_MS;
}

export interface QuotaRunOptions {
  fetchImpl?: typeof fetch;
  now?: () => number;
  cooldownPath?: string;
  sources?: Record<string, CredentialSource>;
  /** Receives non-secret status lines only. */
  onStatus?: (line: string) => void;
}

/**
 * Probes every quota provider. Error text is always a fixed short code; the raw
 * response body is never read into the output.
 */
export async function collectQuotas(options: QuotaRunOptions = {}): Promise<QuotaProvider[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const cooldownPath = options.cooldownPath ?? COOLDOWNS_PATH;
  const sources = options.sources ?? CREDENTIAL_SOURCES;
  const cooldowns = readCooldowns(cooldownPath);
  let dirty = false;

  const results: QuotaProvider[] = [];

  for (const provider of PROVIDERS) {
    const base: QuotaProvider = {
      id: provider.id,
      plan: provider.planFallback,
      status: "error",
      windows: [],
      error: null,
    };

    let credential: Credential | null = null;
    try {
      credential = (await sources[provider.id]?.read()) ?? null;
    } catch {
      credential = null;
    }

    if (!credential) {
      results.push({ ...base, error: "no_credential" });
      options.onStatus?.(`quota ${provider.id}: no_credential`);
      continue;
    }

    const plan = credential.plan || provider.planFallback;
    if (credential.expiresAt !== null && credential.expiresAt <= now()) {
      results.push({ ...base, plan, status: "stale", error: "expired" });
      options.onStatus?.(`quota ${provider.id}: expired`);
      continue;
    }

    const hash = hashToken(credential.token);
    if (cooldowns.blocked.includes(hash)) {
      results.push({ ...base, plan, status: "stale", error: "blocked_credential" });
      options.onStatus?.(`quota ${provider.id}: blocked_credential`);
      continue;
    }
    const until = cooldowns.cooldownUntil[hash];
    if (typeof until === "number" && until > now()) {
      results.push({ ...base, plan, status: "stale", error: "cooldown" });
      options.onStatus?.(`quota ${provider.id}: cooldown`);
      continue;
    }

    const request = provider.request(credential);
    let response: Response;
    try {
      response = await fetchImpl(request.url, {
        headers: request.headers,
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      results.push({ ...base, plan, error: "network_error" });
      options.onStatus?.(`quota ${provider.id}: network_error`);
      continue;
    }

    options.onStatus?.(`quota ${provider.id}: http ${response.status}`);

    if (response.status === 401 || response.status === 403) {
      cooldowns.blocked.push(hash);
      dirty = true;
      results.push({ ...base, plan, status: "stale", error: "unauthorized" });
      continue;
    }

    if (response.status === 429) {
      cooldowns.cooldownUntil[hash] = now() + retryAfterMs(response.headers);
      dirty = true;
      results.push({ ...base, plan, status: "stale", error: "rate_limited" });
      continue;
    }

    if (!response.ok) {
      results.push({ ...base, plan, error: `http_${response.status}` });
      continue;
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (body === null) {
      results.push({ ...base, plan, error: "parse_error" });
      continue;
    }

    const parsed = provider.parse(body);
    if (!parsed) {
      results.push({ ...base, plan, error: "parse_error" });
      continue;
    }

    results.push({
      id: provider.id,
      plan: parsed.plan || plan,
      status: "ok",
      windows: parsed.windows,
      error: null,
    });
  }

  if (dirty) writeCooldowns(cooldowns, cooldownPath);
  return results;
}
