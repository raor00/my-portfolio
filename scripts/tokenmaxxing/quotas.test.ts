import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  clampPercent,
  collectQuotas,
  hashToken,
  mapClaudeQuota,
  mapCodexQuota,
  mapOpencodeQuota,
  mapZaiQuota,
  readCooldowns,
  writeCooldowns,
  type Credential,
  type CredentialSource,
} from "./quotas";
import { validateOutput } from "./sanitize";
import { validOutput } from "./testFixtures";

const claudeFixture = {
  five_hour: { utilization: 44.4, resets_at: "2026-01-02T03:04:05.000Z" },
  seven_day: { used_percentage: 81, resets_at: 1_767_000_000_000 },
};

const codexFixture = {
  plan_type: "pro",
  rate_limit: {
    primary_window: { used_percent: 12.5, limit_window_seconds: 18000, reset_at: 1_767_000_000 },
    secondary_window: { used_percent: 61, limit_window_seconds: 604800, reset_at: 1_767_400_000 },
  },
};

const opencodeFixture = {
  usage: {
    rolling: { percent: 30, resetsAt: "2026-01-02T00:00:00.000Z" },
    weekly: { percent: 55, resetsAt: "2026-01-05T00:00:00.000Z" },
    monthly: { percent: 70, resetsAt: "2026-01-20T00:00:00.000Z" },
  },
};

const zaiFixture = {
  data: {
    level: "max",
    limits: [
      { type: "REQUESTS_LIMIT", unit: 1, percentage: 99 },
      { type: "TOKENS_LIMIT", unit: 3, percentage: 27, nextResetTime: 1_767_000_000_000 },
    ],
  },
};

describe("quota mapping fixtures", () => {
  test("claude windows map utilization with ISO and epoch-ms resets", () => {
    const parsed = mapClaudeQuota(claudeFixture);
    expect(parsed?.windows).toEqual([
      { label: "5h", usedPercent: 44.4, resetsAt: "2026-01-02T03:04:05.000Z", windowSeconds: 18000 },
      { label: "7d", usedPercent: 81, resetsAt: new Date(1_767_000_000_000).toISOString(), windowSeconds: 604800 },
    ]);
  });

  test("codex windows map both rate limit windows and the plan", () => {
    const parsed = mapCodexQuota(codexFixture);
    expect(parsed?.plan).toBe("pro");
    expect(parsed?.windows.map((window) => window.label)).toEqual(["5h", "7d"]);
    expect(parsed?.windows[1].usedPercent).toBe(61);
    expect(parsed?.windows[0].resetsAt).toBe(new Date(1_767_000_000_000).toISOString());
  });

  test("codex windows tolerate a null secondary window", () => {
    const parsed = mapCodexQuota({
      plan_type: "plus",
      rate_limit: {
        primary_window: { used_percent: 5, limit_window_seconds: 18000, reset_at: 1_767_000_000 },
        secondary_window: null,
      },
    });
    expect(parsed?.windows.length).toBe(1);
  });

  test("opencode windows map rolling, weekly and monthly", () => {
    const parsed = mapOpencodeQuota(opencodeFixture);
    expect(parsed?.windows.map((window) => window.label)).toEqual(["5h", "7d", "30d"]);
    expect(parsed?.windows.map((window) => window.usedPercent)).toEqual([30, 55, 70]);
  });

  test("zai picks the TOKENS_LIMIT unit-3 percentage and the plan level", () => {
    const parsed = mapZaiQuota(zaiFixture);
    expect(parsed?.plan).toBe("max");
    expect(parsed?.windows[0].usedPercent).toBe(27);
    expect(parsed?.windows[0].resetsAt).toBe(new Date(1_767_000_000_000).toISOString());
  });

  test("used percentages are clamped to 0..100", () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(140)).toBe(100);
    expect(clampPercent("55.5")).toBe(55.5);
    expect(clampPercent(undefined)).toBe(0);
  });

  test("unknown shapes produce no windows instead of throwing", () => {
    expect(mapClaudeQuota({})).toBeNull();
    expect(mapCodexQuota({ rate_limit: {} })).toBeNull();
    expect(mapOpencodeQuota({})).toBeNull();
    expect(mapZaiQuota({ data: { limits: [] } })).toBeNull();
  });
});

const now = Date.parse("2026-01-01T00:00:00.000Z");
const token = "test-token-do-not-log";

function source(credential: Credential | null): CredentialSource {
  return { read: async () => credential };
}

function fakeFetch(handler: (url: string) => Response): typeof fetch {
  return (async (input: RequestInfo | URL) => handler(String(input))) as unknown as typeof fetch;
}

interface Harness {
  cooldownPath: string;
  cleanup: () => void;
}

function harness(): Harness {
  const dir = mkdtempSync(join(tmpdir(), "tokenmaxxing-quotas-"));
  return {
    cooldownPath: join(dir, "cooldowns.json"),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

const nullSources = {
  claude: { read: async () => null },
  codex: { read: async () => null },
  "opencode-go": { read: async () => null },
  zai: { read: async () => null },
};

function baseOutput() {
  return validOutput();
}


describe("collectQuotas", () => {
  test("reports no_credential without any request", async () => {
    const h = harness();
    let calls = 0;
    const providers = await collectQuotas({
      now: () => now,
      cooldownPath: h.cooldownPath,
      sources: nullSources,
      fetchImpl: fakeFetch(() => {
        calls += 1;
        return new Response("{}");
      }),
    });
    expect(calls).toBe(0);
    expect(providers.length).toBe(4);
    for (const provider of providers) {
      expect(provider.status).toBe("error");
      expect(provider.error).toBe("no_credential");
      expect(provider.windows).toEqual([]);
    }
    h.cleanup();
  });

  test("an expired token is stale and triggers no request", async () => {
    const h = harness();
    let calls = 0;
    const providers = await collectQuotas({
      now: () => now,
      cooldownPath: h.cooldownPath,
      sources: { ...nullSources, claude: source({ token, expiresAt: now - 1000, plan: "max", meta: {} }) },
      fetchImpl: fakeFetch(() => {
        calls += 1;
        return new Response("{}");
      }),
    });
    expect(calls).toBe(0);
    expect(providers[0]).toMatchObject({ id: "claude", status: "stale", error: "expired", plan: "max" });
    h.cleanup();
  });

  test("ok responses map through the fixtures", async () => {
    const h = harness();
    const bodies: Record<string, unknown> = {
      "https://api.anthropic.com/api/oauth/usage": claudeFixture,
      "https://chatgpt.com/backend-api/wham/usage": codexFixture,
      "https://opencode.ai/zen/go/v1/usage": opencodeFixture,
      "https://api.z.ai/api/monitor/usage/quota/limit": zaiFixture,
    };
    const seenUrls: string[] = [];
    const providers = await collectQuotas({
      now: () => now,
      cooldownPath: h.cooldownPath,
      sources: {
        claude: source({ token, expiresAt: now + 60_000, plan: "", meta: {} }),
        codex: source({ token, expiresAt: now + 60_000, plan: "", meta: { accountId: "acct" } }),
        "opencode-go": source({ token, expiresAt: now + 60_000, plan: "", meta: {} }),
        zai: source({ token, expiresAt: null, plan: "", meta: {} }),
      },
      fetchImpl: fakeFetch((url) => {
        seenUrls.push(url);
        return new Response(JSON.stringify(bodies[url]), { status: 200 });
      }),
    });

    expect(seenUrls.sort()).toEqual(Object.keys(bodies).sort());
    expect(providers.map((provider) => provider.status)).toEqual(["ok", "ok", "ok", "ok"]);
    expect(providers[0].windows.length).toBe(2);
    expect(providers[1].plan).toBe("pro");
    expect(providers[3].plan).toBe("max");
    expect(validateOutput({ ...baseOutput(), quotas: providers })).toEqual([]);
    h.cleanup();
  });

  test("401 blocks the credential hash and skips the next call", async () => {
    const h = harness();
    let calls = 0;
    const sources = { ...nullSources, claude: source({ token, expiresAt: now + 600_000, plan: "", meta: {} }) };
    const first = await collectQuotas({
      now: () => now,
      cooldownPath: h.cooldownPath,
      sources,
      fetchImpl: fakeFetch(() => {
        calls += 1;
        return new Response("denied", { status: 401 });
      }),
    });
    expect(first[0]).toMatchObject({ status: "stale", error: "unauthorized" });
    expect(calls).toBe(1);

    const stored = readCooldowns(h.cooldownPath);
    expect(stored.blocked).toContain(hashToken(token));
    expect(readFileSync(h.cooldownPath, "utf8")).not.toContain(token);

    const second = await collectQuotas({
      now: () => now + 60_000,
      cooldownPath: h.cooldownPath,
      sources,
      fetchImpl: fakeFetch(() => {
        calls += 1;
        return new Response("denied", { status: 401 });
      }),
    });
    expect(second[0]).toMatchObject({ status: "stale", error: "blocked_credential" });
    expect(calls).toBe(1);
    h.cleanup();
  });

  test("429 persists a cooldown of at least 15 minutes", async () => {
    const h = harness();
    const sources = { ...nullSources, claude: source({ token, expiresAt: now + 60_000, plan: "", meta: {} }) };
    const first = await collectQuotas({
      now: () => now,
      cooldownPath: h.cooldownPath,
      sources,
      fetchImpl: fakeFetch(() => new Response("slow down", { status: 429, headers: { "retry-after": "60" } })),
    });
    expect(first[0]).toMatchObject({ status: "stale", error: "rate_limited" });
    const stored = readCooldowns(h.cooldownPath);
    const until = stored.cooldownUntil[hashToken(token)];
    expect(until - now).toBeGreaterThanOrEqual(15 * 60 * 1000);

    let calls = 0;
    const second = await collectQuotas({
      now: () => now + 1000,
      cooldownPath: h.cooldownPath,
      sources,
      fetchImpl: fakeFetch(() => {
        calls += 1;
        return new Response("{}", { status: 200 });
      }),
    });
    expect(calls).toBe(0);
    expect(second[0]).toMatchObject({ status: "stale", error: "cooldown" });
    h.cleanup();
  });

  test("network and parse failures become fixed short codes", async () => {
    const h = harness();
    const sources = {
      ...nullSources,
      claude: source({ token, expiresAt: now + 60_000, plan: "", meta: {} }),
      codex: source({ token, expiresAt: now + 60_000, plan: "", meta: {} }),
    };
    const providers = await collectQuotas({
      now: () => now,
      cooldownPath: h.cooldownPath,
      sources,
      fetchImpl: fakeFetch((url) => {
        if (url.includes("anthropic")) throw new Error("offline");
        return new Response("not json", { status: 200 });
      }),
    });
    expect(providers[0]).toMatchObject({ status: "error", error: "network_error" });
    expect(providers[1]).toMatchObject({ status: "error", error: "parse_error" });
    h.cleanup();
  });

  test("cooldown state round-trips with only hashes", () => {
    const h = harness();
    writeCooldowns({ blocked: [hashToken(token)], cooldownUntil: {} }, h.cooldownPath);
    expect(readCooldowns(h.cooldownPath).blocked).toEqual([hashToken(token)]);
    expect(readFileSync(h.cooldownPath, "utf8")).not.toContain(token);
    h.cleanup();
  });
});
