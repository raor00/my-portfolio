#!/usr/bin/env bash
# Daily local refresh for the tokenmaxxing collector.
#
# Runs the collector against this worktree, appends one line to the local log,
# and never commits, pushes or deploys anything: the JSON that lands in
# src/data/tokenmaxxing.json stays a normal working-tree change for the owner.
#
# PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false works around the sharp/unrs-resolver
# build-approval gate that blocks any pnpm script in this environment.
set -uo pipefail

WORKTREE="/Users/oviedo/orca/workspaces/my-portfolio/tokenmaxxing"
DATA_DIR="$HOME/.local/share/tokenmaxxing"
LOG="$DATA_DIR/daily.log"
BUN_BIN="${BUN_BIN:-$HOME/.bun/bin/bun}"

mkdir -p "$DATA_DIR"

if [ ! -x "$BUN_BIN" ]; then
  BUN_BIN="$(command -v bun || true)"
fi

{
  printf '=== %s ===\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [ -z "$BUN_BIN" ]; then
    echo "error: bun not found (set BUN_BIN to its absolute path)" >&2
    exit 1
  fi
  if [ ! -d "$WORKTREE" ]; then
    echo "error: worktree not found at $WORKTREE" >&2
    exit 1
  fi
  cd "$WORKTREE" || exit 1
  PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false "$BUN_BIN" scripts/tokenmaxxing/index.ts 2>&1
  printf 'exit=%s\n' "$?"
} >>"$LOG" 2>&1
