import HomePage, { type TokenUsageSummary } from "@/components/HomePage";
import tokenUsage from "@/data/tokenmaxxing.json";

/**
 * The home page is a client component for the animations, but the token data is
 * reduced here so the aggregate JSON stays on the server and never ships to the
 * browser: only the six scalars below cross the boundary.
 */
export default function Home() {
  const usage: TokenUsageSummary = {
    processedTokens: tokenUsage.totals.processedTokens,
    sessions: tokenUsage.totals.sessions,
    models: tokenUsage.models.length,
    days: tokenUsage.days.length,
    firstUsageDate: tokenUsage.firstUsageDate,
    generatedAt: tokenUsage.generatedAt,
  };

  return <HomePage tokenUsage={usage} />;
}
