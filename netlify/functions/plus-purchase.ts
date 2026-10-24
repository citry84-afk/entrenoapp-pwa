import type { HandlerEvent } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import {
  accessResponse,
  corsHeaders,
  hashValue,
  identityTokenFromHeaders,
  identityUserFromToken,
  json,
  makePayload,
  normalizeDeviceId,
  signPlusToken,
} from "./_shared/plus";

type RevenueCatEntitlement = {
  expires_date?: string | null;
  purchase_date?: string | null;
  product_identifier?: string;
};

type RevenueCatSubscriber = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
    subscriptions?: Record<string, { expires_date?: string | null; product_identifier?: string }>;
  };
};

type AccountPlus = { source: string; expiresAt: number; updatedAt: string };

function revenueCatSecret() {
  const secret = process.env.REVENUECAT_SECRET_API_KEY;
  if (!secret) throw new Error("REVENUECAT_SECRET_API_KEY is not configured");
  return secret;
}

function normalizeAppUserID(value: unknown) {
  return String(value || "").trim().slice(0, 160);
}

function entitlementExpiry(data: RevenueCatSubscriber) {
  const entitlements = data.subscriber?.entitlements || {};
  const plus = entitlements.plus;
  if (!plus) return null;
  if (!plus.expires_date) return Date.now() + 10 * 365 * 86400000;
  const expiresAt = Date.parse(plus.expires_date);
  return Number.isFinite(expiresAt) && expiresAt > Date.now() ? expiresAt : null;
}

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = JSON.parse(event.body || "{}");
    const deviceId = normalizeDeviceId(body.deviceId);
    const appUserID = normalizeAppUserID(body.appUserID);
    if (!deviceId || !appUserID) return json({ error: "Compra Plus no válida" }, 400);

    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserID)}`, {
      headers: { Authorization: `Bearer ${revenueCatSecret()}` },
    });
    if (!response.ok) return json({ error: "No se ha podido verificar la suscripción Plus" }, 502);

    const data = await response.json() as RevenueCatSubscriber;
    const expiresAt = entitlementExpiry(data);
    if (!expiresAt) return json({ error: "No hay una suscripción Plus activa" }, 403);

    const payload = makePayload(deviceId, "subscription", expiresAt);
    const token = signPlusToken(payload);

    const identityUser = await identityUserFromToken(identityTokenFromHeaders(event.headers));
    if (identityUser?.id) {
      try {
        const store = getStore({ name: "entrenoapp-plus-accounts", consistency: "strong" });
        const key = `account/${hashValue(identityUser.id)}`;
        const current = await store.get(key, { type: "json" }) as AccountPlus | null;
        const saved: AccountPlus = {
          source: "subscription",
          expiresAt: Math.max(current?.expiresAt || 0, expiresAt),
          updatedAt: new Date().toISOString(),
        };
        await store.setJSON(key, saved);
      } catch (accountError) {
        console.warn("plus-purchase account link skipped", accountError);
      }
    }

    return json({ ...accessResponse(payload, token), purchase: { verified: true, source: "revenuecat" } });
  } catch (error) {
    console.error("plus-purchase", error);
    return json({ error: "No se ha podido activar Plus con la compra" }, 500);
  }
};
