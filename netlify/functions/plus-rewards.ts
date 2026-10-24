import type { HandlerEvent } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import {
  accessResponse,
  bearerTokenFromHeaders,
  corsHeaders,
  hashValue,
  json,
  makePayload,
  normalizeCode,
  normalizeDeviceId,
  referralCodeFor,
  signPlusToken,
  verifyPlusToken,
} from "./_shared/plus";

type Referral = {
  code: string;
  owner: string;
  redemptions: string[];
  count: number;
  claimedMonths: number;
  createdAt: string;
  updatedAt: string;
};

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = JSON.parse(event.body || "{}");
    const action = String(body.action || "");
    const deviceId = normalizeDeviceId(body.deviceId);
    if (!deviceId) return json({ error: "Dispositivo no válido" }, 400);
    const store = getStore({ name: "entrenoapp-plus-rewards", consistency: "strong" });

    if (action === "redeem") {
      const code = normalizeCode(body.code);
      const key = `referral/${code}`;
      const referral = await store.get(key, { type: "json" }) as Referral | null;
      if (!referral) return json({ error: "Invitación no válida" }, 404);
      const recipient = hashValue(deviceId);
      if (recipient === referral.owner) return json({ error: "No puedes usar tu propia invitación" }, 409);
      if (!referral.redemptions.includes(recipient)) {
        referral.redemptions.push(recipient);
        referral.count = referral.redemptions.length;
        referral.updatedAt = new Date().toISOString();
        await store.setJSON(key, referral);
      }
      const payload = makePayload(deviceId, `reward:${code}`, Date.now() + 7 * 86400000);
      return json({ ...accessResponse(payload, signPlusToken(payload)), reward: { trialDays: 7 } });
    }

    const access = verifyPlusToken(bearerTokenFromHeaders(event.headers), deviceId);
    const code = referralCodeFor(access.sub);
    const key = `referral/${code}`;
    const existing = await store.get(key, { type: "json" }) as Referral | null;
    const referral = existing || {
      code,
      owner: access.sub,
      redemptions: [],
      count: 0,
      claimedMonths: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!existing) await store.setJSON(key, referral);

    const earnedMonths = Math.floor(referral.count / 3);
    let refreshed: ReturnType<typeof accessResponse> | null = null;
    if (action === "status" && earnedMonths > referral.claimedMonths) {
      const newMonths = earnedMonths - referral.claimedMonths;
      const payload = makePayload(deviceId, access.source, Math.max(access.exp, Date.now()) + newMonths * 30 * 86400000);
      referral.claimedMonths = earnedMonths;
      referral.updatedAt = new Date().toISOString();
      await store.setJSON(key, referral);
      refreshed = accessResponse(payload, signPlusToken(payload));
    }

    return json({
      referral: {
        code,
        shareUrl: `https://entrenoapp.com/app.html?ref=${encodeURIComponent(code)}`,
        activations: referral.count,
        earnedMonths,
        nextRewardAt: (earnedMonths + 1) * 3,
      },
      refreshed,
    });
  } catch (error) {
    console.error("plus-rewards", error);
    return json({ error: "No se ha podido actualizar Rewards" }, 401);
  }
};
