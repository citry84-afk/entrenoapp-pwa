import type { HandlerEvent } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import {
  accessResponse,
  bearerTokenFromHeaders,
  corsHeaders,
  hashValue,
  identityTokenFromHeaders,
  identityUserFromToken,
  json,
  makePayload,
  normalizeDeviceId,
  signPlusToken,
  verifyPlusToken,
} from "./_shared/plus";

type AccountPlus = { source: string; expiresAt: number; updatedAt: string };

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = JSON.parse(event.body || "{}");
    const action = String(body.action || "restore");
    const deviceId = normalizeDeviceId(body.deviceId);
    if (!deviceId) return json({ error: "Dispositivo no válido" }, 400);

    const identityUser = await identityUserFromToken(identityTokenFromHeaders(event.headers));
    if (!identityUser?.id) return json({ error: "Inicia sesión para recuperar Plus" }, 401);

    const store = getStore({ name: "entrenoapp-plus-accounts", consistency: "strong" });
    const key = `account/${hashValue(identityUser.id)}`;
    const current = await store.get(key, { type: "json" }) as AccountPlus | null;

    if (action === "link") {
      const plusToken = bearerTokenFromHeaders(event.headers);
      const access = verifyPlusToken(plusToken, deviceId);
      const saved: AccountPlus = {
        source: current?.expiresAt && current.expiresAt > access.exp ? current.source : access.source,
        expiresAt: Math.max(current?.expiresAt || 0, access.exp),
        updatedAt: new Date().toISOString(),
      };
      await store.setJSON(key, saved);
      return json({ linked: true, access: { tier: "plus", source: saved.source, expiresAt: new Date(saved.expiresAt).toISOString() } });
    }

    if (!current || current.expiresAt <= Date.now()) return json({ error: "Esta cuenta no tiene Plus activo" }, 404);
    const payload = makePayload(deviceId, current.source, current.expiresAt);
    return json({ ...accessResponse(payload, signPlusToken(payload)), restored: true });
  } catch (error) {
    console.error("plus-account", error);
    return json({ error: "No se ha podido recuperar Plus ahora" }, 500);
  }
};
