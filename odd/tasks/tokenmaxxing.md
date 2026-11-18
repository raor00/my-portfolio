# Feature: Tokenmaxxing (my-portfolio)

## Objective
Add a public `/tokenmaxxing` page to the portfolio showing Rafael's daily AI token usage (per provider/model, estimated cost) and a quota snapshot. Data comes from a LOCAL collector that writes a sanitized aggregate JSON committed to the repo. The site stays fully static: no runtime reads of local files, no secrets in Vercel.

## Architecture
1. `scripts/tokenmaxxing/` — Bun script, run locally: `bun run tokenmaxxing` (add to package.json scripts; pnpm stays the package manager, the script just uses Bun's runtime: `bun scripts/tokenmaxxing/index.ts`).
   - Ingests transcripts read-only into a local ledger OUTSIDE the repo: `~/.local/share/tokenmaxxing/ledger.db` (bun:sqlite).
   - Quotas are OPT-IN: only with `--quotas`. Default run writes `"quotas": []`.
   - Writes `src/data/tokenmaxxing.json` (aggregates only) and prints a one-line summary.
2. `src/app/tokenmaxxing/page.tsx` — `"use client"` page importing the JSON statically.
3. Navbar link + ES/EN strings in `src/i18n/translations.ts`.

## Hard safety rules
- Open every credential / transcript / DB read-only. Never write to `~/.claude`, `~/.codex`, `~/.local/share/opencode`, `~/.pi`.
- Never call any OAuth refresh endpoint. Expired token → provider `stale`, no request. 401/403 → `stale`, store SHA-256 of the token in `~/.local/share/tokenmaxxing/cooldowns.json`; don't call again until the hash changes.
- 429 → cooldown `max(Retry-After, 15 min)` per token hash, persisted in the same file.
- Never print tokens in logs/errors (redact `Bearer [redacted]`).
- Network: only the 4 quota endpoints and the LiteLLM price JSON (cached daily at `~/.local/share/tokenmaxxing/litellm-prices.json`).
- YOU (the agent) never run `security find-generic-password`, never read/print `~/.codex/auth.json` or `~/.local/share/opencode/auth.json`, never query the opencode `credential` table by hand. Your shell output goes to a model provider. Only the script touches credentials; quota code is tested with fixtures; a real `--quotas` run prints status codes only.
- `tsconfig.json`: add `scripts` to `exclude` (and ESLint ignores if it globs there) so `next build` never type-checks `bun:*` imports. Do not add Bun types to the app.
- Provider/model strings must match `^[A-Za-z0-9._:\[\]-][A-Za-z0-9._:/\[\]-]*$` (no leading `/` or `~`); otherwise bucket as `other`.
- The output JSON is PUBLIC. It may contain ONLY: dates, provider ids, model names, token counts, USD estimates, quota usedPercent/resetsAt/plan label, generatedAt. NO tokens, account ids, emails, session ids, file paths, project names, prompts or transcript text. Enforce with a test that (a) asserts the JSON key set is exactly the schema below, (b) all provider/model strings match the allowlist regex, (c) no `/Users/`, `~/`, `Bearer`, `sk-`, `eyJ` substring.

## Quotas
Normalize window: `{label, usedPercent (0..100 clamp, ALWAYS used), resetsAt ISO|null, windowSeconds}`. Provider: `{id, plan, status: ok|stale|error, windows[], error}` (error text is a fixed short code, never a raw response).
Reset helper: number > 1e10 → ms, else seconds; numeric string same; else Date.parse.

| Provider | Credential (read-only) | Request | Field |
|---|---|---|---|
| Claude | Two sources, both read-only: `security find-generic-password -s "Claude Code-credentials" -w` and `~/.claude/.credentials.json` → JSON `claudeAiOauth.{accessToken,expiresAt(ms),subscriptionType}`; use whichever has the later `expiresAt` (the file copy is currently expired) | `GET https://api.anthropic.com/api/oauth/usage`, headers `Authorization: Bearer`, `anthropic-beta: oauth-2025-04-20`, `User-Agent: claude-code/2.1.0` | `five_hour`/`seven_day`.`utilization` (fallback `used_percentage`), `resets_at`. Windows 18000 / 604800 s |
| Codex | `~/.codex/auth.json` → `tokens.access_token`, `tokens.account_id`; expiry = JWT `exp` (s) | `GET https://chatgpt.com/backend-api/wham/usage`, headers Bearer, `ChatGPT-Account-Id`, `User-Agent: codex-cli`, `OpenAI-Beta: codex-1`, `originator: Codex Desktop` | `rate_limit.primary_window`/`secondary_window` (either may be null): `used_percent`, `limit_window_seconds` (18000→5h, 604800→7d), `reset_at` epoch s. `plan_type` = plan |
| OpenCode Go | `~/.local/share/opencode/opencode.db` read-only (`file:...?mode=ro`, fallback `?immutable=1`): `SELECT value FROM credential WHERE integration_id='opencode' ORDER BY time_updated DESC`; first JSON with `type=="oauth"` → `access`, `expires`(ms) | `GET https://opencode.ai/zen/go/v1/usage` Bearer | `usage.rolling`(5h) / `weekly` / `monthly` `.percent` = used, `resetsAt` ISO |
| GLM / Z.ai | `~/.local/share/opencode/auth.json` → `zai-coding-plan.key`. Absent on this Mac → `status:"error", error:"no_credential"`, no request | `GET https://api.z.ai/api/monitor/usage/quota/limit` Bearer | entry `type=="TOKENS_LIMIT" && unit==3` → `percentage` used; `nextResetTime` ms; `data.level` = plan |

Endpoints, headers and response fields above are UNVERIFIED (from a guide); only fixture tests + a real `--quotas` run (status codes only) can prove them — report honestly. Codex fallback idea (not required): `token_count` events also carry `rate_limits` (primary/secondary, plan_type) offline.

## Ledger (incremental — sources total ~8 GB)
Table `usage`: agent, provider, model, external_id, input_tokens (UNCACHED), cache_read_tokens, cache_write_tokens, output_tokens, reasoning_tokens (info only), reported_cost_usd, occurred_at (UTC ISO), usage_date (LOCAL YYYY-MM-DD). `UNIQUE(agent, external_id)`, `INSERT OR REPLACE`. Table `source_file(path PK, size, mtime_ms)` to skip unchanged files. Skip rows with all tokens 0. Ignore a truncated last JSONL line. Stream files line by line; never load a whole file in memory.

Sources:
- **Claude Code** `~/.claude/projects/**/*.jsonl` (4.7 GB; walk RECURSIVELY — ~400 files live in nested subagent dirs). Lines with `message.usage` + `message.model` + `message.id`. Key = `message.id` (same id appears on up to 9 lines + resumed sessions). Streaming: ~0.8% of ids carry DIFFERENT usage across their lines → keep the line with the max `output_tokens` per id, never last-write-wins. provider `anthropic`. Skip model `<synthetic>`. `input_tokens` already uncached; cache via `cache_read_input_tokens` / `cache_creation_input_tokens`.
- **Codex** `~/.codex/sessions/**/rollout-*.jsonl` AND `~/.codex/archived_sessions/**/*.jsonl`. Session id: use the FIRST `session_meta` line's `payload.id` (fork/subagent files carry a second `session_meta` = the parent; in forks `id != session_id`, so never key on `session_id`). `turn_context.payload.model` (changes mid-session in ~40 sessions); each `event_msg` with `payload.type=="token_count"` = one row from `payload.info.last_token_usage` (if only totals exist, diff vs previous total); model = last seen turn_context. `last_token_usage.cache_write_input_tokens` → cache_write (always 0 so far). Drop event whose signature `input:cached:write:output:reasoning` equals the previous one (removes intra-file re-announcements; cross-file dupes verified 0). uncached = `input_tokens - cached_input_tokens`. Key = `<first session_meta id>:timestamp:model`. IGNORE `token_usage_record` lines (new type, duplicates `token_count` → double count). provider `openai`.
- **opencode** `~/.local/share/opencode/opencode.db` (1.6 GB, live WAL; legacy `storage/message` JSON dir does NOT exist — DB only). When `(size,mtime)` changed: copy `.db` + `-wal` + `-shm` to a temp dir, read the copy, delete it; advance by `rowid` watermark. `SELECT rowid,id,data FROM message`; `data.role=="assistant"`: provider = `providerID` (never infer from model; seen: `opencode`, `nan`, `tokenrouter`), `modelID`, `tokens.{input,output,reasoning,cache.read,cache.write}`, `cost` (>0 → reported; currently 0 on every row, so expect LiteLLM pricing for all), time object `time.completed||time.created` (ms). Many rows are all-zero → skip. Key = message id.
- **Pi** `~/.pi/agent/sessions/**/*.jsonl` (1.7 GB). Lines `type=="message"`, `message.role=="assistant"`, `message.usage`: provider = `message.provider`, model = `message.model`, `{input (uncached), output, cacheRead, cacheWrite, reasoning, cost.total}`. Verified: `totalTokens == input+output+cacheRead+cacheWrite` (the old "input+output+cacheRead" claim was wrong whenever cacheWrite>0). `cost.total>0` → reported only when `cost.totalFromProvider` is true; otherwise treat as unreported and price via LiteLLM. Time = line `timestamp`. Key = `message.responseId` (fallback `<file basename>:<line id>`) — the same response is copied across forked session files (~950 dupes), so basename keys double count. agent `pi`.

## Aggregation → `src/data/tokenmaxxing.json`
Provider aliases: zen/opencode/opencode-zen → opencode-zen, zai* → zai, openai-codex → openai, '' → unknown (Pi's `anthropic` stays `anthropic`).
- processed = input + cache_read + cache_write + output (never add reasoning).
- cost = reported + unreported tokens × LiteLLM rates (`https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json`). Lookup: exact model (strip `[1m]`-style suffix) → provider prefix (`opencode-go`→`opencode_go/`, `zai*`→`zai/`) → bare alias only if every prefixed entry for it agrees on price → else $0 and list in `unpricedModels`. Never invent prices. The prefixes above are UNVERIFIED — check them against the downloaded JSON and report misses.
- `sessions` count (distinct session ids in the window) goes into `totals`.
- Shape (last 365 days):
```json
{ "generatedAt": "ISO", "timezone": "America/Caracas-or-local-IANA",
  "totals": { "processedTokens": 0, "costUsd": 0, "cacheSavingsUsd": 0, "sessions": 0 },
  "days": [{ "date": "YYYY-MM-DD", "providers": { "anthropic": { "tokens": 0, "costUsd": 0 } } }],
  "models": [{ "provider": "", "model": "", "tokens": 0, "costUsd": 0, "lastUsed": "YYYY-MM-DD" }],
  "quotas": [ /* provider objects above */ ],
  "unpricedModels": [] }
```
Keep the file small (round USD to cents, no per-model-per-day breakdown).

## Page `/tokenmaxxing`
Follow `CLAUDE.md` in the repo: light theme, amber accent, IBM Plex Mono labels (`.tech-label`), framer-motion variants (fadeUp/stagger) as the other pages, inline `style` colors OK, `"use client"` + `useLanguage()`.
- Hero: title "Tokenmaxxing", one-line subtitle, "last updated" from `generatedAt`.
- Stat row: processed tokens, est. cost, cache savings for the selected window.
- Quota tiles: hidden entirely when `quotas` is empty. When present: per provider REMAINING `100-usedPercent` ("56% left"), bar, `stale`/`error` badge, labeled "snapshot as of <generatedAt>". No live countdown (data is frozen).
- Stacked area chart per day by provider: inline SVG, no new chart deps. Toggle metric tokens/$ and window 7/30/90/365. Fill missing days with 0. Top 5 providers + "other", stable colors. Hover tooltip: date, total, split.
- Models table: provider, model, tokens, $, share; sortable not required.
- Compact number format (1.2M, 3.4B). Mobile-friendly.
- Navbar: add `{ href: "/tokenmaxxing", label: t.nav.tokenmaxxing }`; add ES/EN keys for every new string.

## Constraints
- Work in the Orca worktree on branch `feat/tokenmaxxing` from `origin/main`. Do NOT touch the user's uncommitted changes in the main checkout.
- Conventional commits, NO AI attribution / Co-Authored-By lines. Do NOT push, do NOT deploy, do NOT open a PR.
- Execution on Pi only; on quota/429 switch to another `nan/*` model, then `opencode-go/deepseek-v4.1-flash`. Never Claude/Grok executors. Forward this rule if you delegate.
- No new runtime deps. Bun-only APIs live under `scripts/` and must not be imported by the Next app. Code, comments and UI copy in English (ES strings only in translations.ts).
- Use `rg`/`fd`/`bat`/`eza` instead of grep/find/cat/ls.
- Keep this doc as `odd/tasks/tokenmaxxing.md` in the worktree; check off tasks as they land, recording the commit hash.

## Tasks
- [x] T1 Collector: parsers + ledger + `bun test` (scripts/tokenmaxxing/*.test.ts). Commit `f42aaf9`.
- [x] T2 Aggregation + pricing + quotas + JSON writer + sanitization test; run it for real, commit the generated JSON.
- [ ] T3 Page + navbar + i18n. `pnpm build` green. Commit.

## Commits
- T1 `f42aaf9` feat(collector): add incremental token usage ledger and transcript parsers

## Observable acceptance (report each as `<command>: <observed result>`)
1. `bun test scripts/tokenmaxxing` green, covering: Claude dedupe by message.id keeping max output + skip `<synthetic>`; Codex cached subtraction, duplicate-event drop, mid-session model switch, fork file keyed by first session_meta, `token_usage_record` ignored; Pi mapping + responseId dedupe across files; opencode mapping; reset normalizer (s/ms/ISO); local `usage_date` across UTC midnight; JSON sanitization scan.
2. `bun run tokenmaxxing` → first full run duration, ledger row counts per agent; second run reports N files skipped as unchanged and only re-reads changed ones (live sessions keep changing — that is expected).
3. `jq '.totals, .quotas' src/data/tokenmaxxing.json` → non-zero tokens, `quotas: []` (committed default run). Quota mapping proven by fixture tests only.
4. `rg -n '/Users/|Bearer|eyJ|sk-' src/data/tokenmaxxing.json` → no matches.
5. `pnpm build` green (and `pnpm lint` if a `lint` script exists in package.json).
6. `git log --oneline origin/main..HEAD` → 3 conventional commits, no attribution lines.
Close with a report: Changed / Found / Blocked.
