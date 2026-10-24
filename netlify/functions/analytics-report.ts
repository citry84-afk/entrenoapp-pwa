import { timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const STORE_NAME = "entrenoapp-product-events";
const MAX_DAYS = 90;
const COLLECTION_STARTED_AT = "2026-07-28T17:12:41.399Z";

type StoredEvent = {
  event?: string;
  received_at?: string;
  dimensions?: Record<string, string | number | boolean>;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function env(name: string) {
  return globalThis.Netlify?.env?.get(name) || "";
}

function authorized(req: Request) {
  const expected = env("ANALYTICS_ADMIN_TOKEN");
  const supplied = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!expected || !supplied) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

function utcDays(count: number) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (count - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

function percent(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 1_000) / 10 : 0;
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const requestedDays = Number(url.searchParams.get("days") || 30);
  const days = Math.max(1, Math.min(MAX_DAYS, Math.round(requestedDays) || 30));
  const dateKeys = utcDays(days);
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const events: StoredEvent[] = [];

  for (const day of dateKeys) {
    for await (const page of store.list({ prefix: `events/${day}/`, paginate: true })) {
      for (let index = 0; index < page.blobs.length; index += 25) {
        const batch = page.blobs.slice(index, index + 25);
        const records = await Promise.all(batch.map(({ key }) => store.get(key, { type: "json" }) as Promise<StoredEvent | null>));
        events.push(...records.filter((record): record is StoredEvent => Boolean(record?.event)));
      }
    }
  }

  const reportableEvents = events.filter((event) =>
    event.dimensions?.platform !== "test" &&
    String(event.received_at || "") >= COLLECTION_STARTED_AT
  );
  const byEvent: Record<string, number> = {};
  const byPlatform: Record<string, number> = {};
  const byAcquisitionSource: Record<string, number> = {};
  const marketingCtaBySource: Record<string, number> = {};
  const marketingCtaByDestination: Record<string, number> = {};
  const byDay: Record<string, Record<string, number>> = Object.fromEntries(dateKeys.map((day) => [day, {}]));

  for (const event of reportableEvents) {
    const name = String(event.event || "unknown");
    const day = String(event.received_at || "").slice(0, 10);
    const platform = String(event.dimensions?.platform || "unknown");
    const acquisitionSource = String(event.dimensions?.acquisition_source || "unknown");
    byEvent[name] = (byEvent[name] || 0) + 1;
    byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    byAcquisitionSource[acquisitionSource] = (byAcquisitionSource[acquisitionSource] || 0) + 1;
    if (name === "marketing_cta_click") {
      const source = String(event.dimensions?.interaction_source || "unknown");
      const destination = String(event.dimensions?.feature || "unknown");
      marketingCtaBySource[source] = (marketingCtaBySource[source] || 0) + 1;
      marketingCtaByDestination[destination] = (marketingCtaByDestination[destination] || 0) + 1;
    }
    if (byDay[day]) byDay[day][name] = (byDay[day][name] || 0) + 1;
  }

  const funnelDefinition = [
    ["app_first_open", "Primera apertura"],
    ["onboarding_viewed", "Onboarding mostrado"],
    ["onboarding_started", "Onboarding iniciado"],
    ["onboarding_complete", "Onboarding terminado"],
    ["first_workout_started", "Primer entreno iniciado"],
    ["first_exercise_completed", "Primer ejercicio completado"],
    ["first_workout_saved", "Primer entreno guardado"],
    ["activation_second_workout_7d", "Segundo entrenamiento en 7 días"],
    ["plus_paywall_view", "Paywall visto"],
    ["plus_purchase_success", "Compra completada"],
  ] as const;

  const funnel = funnelDefinition.map(([event, label], index) => {
    const count = byEvent[event] || 0;
    const previous = index ? byEvent[funnelDefinition[index - 1][0]] || 0 : count;
    return { event, label, count, conversion_from_previous_pct: index ? percent(count, previous) : 100 };
  });

  return json({
    generated_at: new Date().toISOString(),
    collection_started_at: COLLECTION_STARTED_AT,
    period: { days, from: dateKeys[0], to: dateKeys[dateKeys.length - 1] },
    privacy: "Aggregate product events only; no workout contents, email, IP address or persistent device identifier is stored.",
    total_events: reportableEvents.length,
    funnel,
    marketing: {
      page_views: byEvent.marketing_page_view || 0,
      cta_clicks: byEvent.marketing_cta_click || 0,
      page_to_cta_pct: percent(byEvent.marketing_cta_click || 0, byEvent.marketing_page_view || 0),
      cta_by_source: marketingCtaBySource,
      cta_by_destination: marketingCtaByDestination,
    },
    purchases: {
      paywall_views: byEvent.plus_paywall_view || 0,
      plans_selected: byEvent.plus_plan_selected || 0,
      started: byEvent.plus_purchase_started || 0,
      completed: byEvent.plus_purchase_success || 0,
      cancelled: byEvent.plus_purchase_cancelled || 0,
      failed: byEvent.plus_purchase_failed || 0,
      restored: byEvent.plus_restore_success || 0,
      paywall_to_purchase_pct: percent(byEvent.plus_purchase_success || 0, byEvent.plus_paywall_view || 0),
    },
    retention: {
      activated_in_24h: byEvent.activation_first_workout_24h || 0,
      second_workout_in_7d: byEvent.activation_second_workout_7d || 0,
      returned_after_1d: byEvent.retention_returned_after_1d || 0,
      returned_after_7d: byEvent.retention_returned_after_7d || 0,
    },
    by_platform: byPlatform,
    by_acquisition_source: byAcquisitionSource,
    by_event: byEvent,
    by_day: byDay,
  });
};

export const config: Config = {
  path: "/api/analytics/report",
};
