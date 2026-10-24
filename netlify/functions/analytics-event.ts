import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const STORE_NAME = "entrenoapp-product-events";
const MAX_BODY_BYTES = 4_096;

const ALLOWED_EVENTS = new Set([
  "analytics_rollout",
  "marketing_page_view",
  "marketing_cta_click",
  "app_first_open",
  "app_session_started",
  "onboarding_viewed",
  "onboarding_started",
  "quick_start_selected",
  "onboarding_complete",
  "daily_plan_started",
  "workout_started",
  "first_workout_started",
  "first_exercise_completed",
  "first_workout_saved",
  "session_saved",
  "next_workout_planned",
  "activation_first_workout_24h",
  "activation_second_workout_7d",
  "retention_returned_after_1d",
  "retention_returned_after_7d",
  "review_prompt_shown",
  "review_store_opened",
  "plus_locked_tap",
  "plus_paywall_view",
  "plus_paywall_ready",
  "plus_paywall_error",
  "plus_plan_selected",
  "plus_purchase_started",
  "plus_purchase_success",
  "plus_purchase_cancelled",
  "plus_purchase_failed",
  "plus_restore_started",
  "plus_restore_success",
  "plus_restore_empty",
  "plus_restore_failed",
  "plus_access_enabled",
]);

const STRING_DIMENSIONS = new Set([
  "platform",
  "app_version",
  "language",
  "acquisition_source",
  "acquisition_medium",
  "acquisition_campaign",
  "interaction_source",
  "entry",
  "workout_mode",
  "feature",
  "plan",
  "product_id",
  "store",
  "error_category",
]);

const NUMBER_DIMENSIONS = new Set(["session_number", "exercise_number"]);
const BOOLEAN_DIMENSIONS = new Set(["has_profile"]);

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function cleanToken(value: unknown, maxLength = 64) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_.:$-]/g, "_")
    .slice(0, maxLength);
}

function cleanDimensions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, string | number | boolean> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (STRING_DIMENSIONS.has(key)) {
      const cleaned = cleanToken(raw, key === "product_id" ? 96 : 64);
      if (cleaned) result[key] = cleaned;
    } else if (NUMBER_DIMENSIONS.has(key)) {
      const number = Math.max(0, Math.min(100_000, Math.round(Number(raw))));
      if (Number.isFinite(number)) result[key] = number;
    } else if (BOOLEAN_DIMENSIONS.has(key) && typeof raw === "boolean") {
      result[key] = raw;
    }
  }
  return result;
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") return response({}, 204);
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return response({ error: "Payload too large" }, 413);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return response({ error: "Payload too large" }, 413);
    const body = JSON.parse(raw || "{}") as { event?: unknown; dimensions?: unknown };
    const event = cleanToken(body.event, 80);
    if (!ALLOWED_EVENTS.has(event)) return response({ error: "Unknown event" }, 400);

    const receivedAt = new Date();
    const day = receivedAt.toISOString().slice(0, 10);
    const key = `events/${day}/${receivedAt.getTime()}-${crypto.randomUUID()}.json`;
    const record = {
      schema: 1,
      event,
      received_at: receivedAt.toISOString(),
      dimensions: cleanDimensions(body.dimensions),
    };

    const store = getStore({ name: STORE_NAME });
    await store.setJSON(key, record, { metadata: { event, day } });
    return response({ accepted: true }, 202);
  } catch (error) {
    console.error("analytics-event", error);
    return response({ error: "Event not accepted" }, 400);
  }
};

export const config: Config = {
  path: "/api/analytics/event",
};
