import { track } from "@vercel/analytics";

/**
 * Cookieless custom events for Vercel Web Analytics.
 *
 * `track` is client-only, so every call is guarded: server components and the
 * static export path simply do nothing. Event names stay stable and low
 * cardinality so the dashboard stays readable.
 */
export type AnalyticsEvent =
  | "contact_submit_success"
  | "contact_submit_error"
  | "cta_hire_click"
  | "cta_contact_click"
  | "project_card_open"
  | "project_demo_open"
  | "language_switch"
  | "cv_download";

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  try {
    track(event, properties);
  } catch {
    // Analytics must never break navigation or form submission.
  }
}
