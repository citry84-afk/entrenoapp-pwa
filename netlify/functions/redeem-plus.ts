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
  normalizeCode,
  normalizeDeviceId,
  parseAccessCodes,
  signPlusToken,
} from "./_shared/plus";

type CodeUsage = { devices: string[]; count: number; updatedAt: string };
type AccountPlus = { source: string; expiresAt: number; updatedAt: string };

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = JSON.parse(event.body || "{}");
    const code = normalizeCode(body.code);
    const deviceId = normalizeDeviceId(body.deviceId);
    if (!code || !deviceId) return json({ error: "Código y dispositivo son obligatorios" }, 400);

    const codes = parseAccessCodes();
    const developmentCode = process.env.CONTEXT !== "production" && code === "ENTRENO-DEMO"
      ? { days: 7, maxUses: 1000, label: "Local demo" }
      : null;
    const config = codes[code] || developmentCode;
    if (!config) return json({ error: "Este código no es válido" }, 404);

    const deviceHash = hashValue(deviceId);
    let alreadyUsed = false;
    try {
      const store = getStore({ name: "entrenoapp-plus-codes", consistency: "strong" });
      const key = `usage/${hashValue(code)}`;
      const usage = (await store.get(key, { type: "json" }) as CodeUsage | null) || { devices: [], count: 0, updatedAt: "" };
      alreadyUsed = usage.devices.includes(deviceHash);
      if (!alreadyUsed && config.maxUses && usage.count >= config.maxUses) {
        return json({ error: "Este código ya ha alcanzado su límite de activaciones" }, 409);
      }

      if (!alreadyUsed) {
        usage.devices.push(deviceHash);
        usage.count += 1;
        usage.updatedAt = new Date().toISOString();
        await store.setJSON(key, usage);
      }
    } catch (usageError) {
      console.warn("plus code usage tracking skipped", usageError);
    }

    const days = config.lifetime ? 3650 : (config.days || (config.months || 1) * 30);
    const expiresAt = Date.now() + days * 86400000;
    const source = `code:${config.label || code}`;
    const payload = makePayload(deviceId, source, expiresAt);
    let accountLinked = false;
    const identityUser = await identityUserFromToken(identityTokenFromHeaders(event.headers)).catch(() => null);
    if (identityUser?.id) {
      try {
        const accountStore = getStore({ name: "entrenoapp-plus-accounts", consistency: "strong" });
        const accountKey = `account/${hashValue(identityUser.id)}`;
        const existing = await accountStore.get(accountKey, { type: "json" }) as AccountPlus | null;
        const saved: AccountPlus = {
          source: existing?.expiresAt && existing.expiresAt > expiresAt ? existing.source : source,
          expiresAt: Math.max(existing?.expiresAt || 0, expiresAt),
          updatedAt: new Date().toISOString(),
        };
        await accountStore.setJSON(accountKey, saved);
        accountLinked = true;
      } catch (accountError) {
        console.warn("plus account link skipped", accountError);
      }
    }
    return json({ ...accessResponse(payload, signPlusToken(payload)), alreadyUsed, accountLinked });
  } catch (error) {
    console.error("redeem-plus", error);
    return json({ error: "No se ha podido activar Plus ahora" }, 500);
  }
};
