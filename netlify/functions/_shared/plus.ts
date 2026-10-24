import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type PlusTokenPayload = {
  sub: string;
  tier: "plus";
  source: string;
  iat: number;
  exp: number;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-identity-token, x-plus-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

export function json(data: unknown, status = 200) {
  return {
    statusCode: status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  };
}

export function normalizeCode(value: unknown) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 48);
}

export function normalizeDeviceId(value: unknown) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 96);
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function tokenSecret() {
  const secret = process.env.PLUS_TOKEN_SECRET;
  if (!secret || secret.length < 24) throw new Error("PLUS_TOKEN_SECRET is not configured");
  return secret;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function signPlusToken(payload: PlusTokenPayload) {
  const body = encode(payload);
  const signature = createHmac("sha256", tokenSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyPlusToken(token: string, deviceId?: string) {
  const [body, supplied] = String(token || "").split(".");
  if (!body || !supplied) throw new Error("Invalid access token");
  const expected = createHmac("sha256", tokenSecret()).update(body).digest("base64url");
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Invalid access token");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PlusTokenPayload;
  if (payload.tier !== "plus" || !payload.exp || payload.exp <= Date.now()) throw new Error("Access expired");
  if (deviceId && payload.sub !== hashValue(normalizeDeviceId(deviceId))) throw new Error("Access belongs to another device");
  return payload;
}

export function bearerToken(req: Request) {
  return (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
}

export function bearerTokenFromHeaders(headers: Record<string, string | undefined>) {
  return (headers.authorization || headers.Authorization || headers["x-plus-token"] || headers["X-Plus-Token"] || "").replace(/^Bearer\s+/i, "").trim();
}

export function identityTokenFromHeaders(headers: Record<string, string | undefined>) {
  return (headers["x-identity-token"] || headers["X-Identity-Token"] || "").replace(/^Bearer\s+/i, "").trim();
}

export async function identityUserFromToken(token: string) {
  if (!token) return null;
  const origin = process.env.URL || "https://entrenoapp.com";
  const response = await fetch(`${origin.replace(/\/$/, "")}/.netlify/identity/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string; email?: string };
  if (!user.id) return null;
  return { id: user.id, email: user.email || "" };
}

export function accessResponse(payload: PlusTokenPayload, token: string) {
  return {
    token,
    access: {
      tier: "plus",
      source: payload.source,
      expiresAt: new Date(payload.exp).toISOString(),
    },
  };
}

export function makePayload(deviceId: string, source: string, expiresAt: number): PlusTokenPayload {
  const now = Date.now();
  return { sub: hashValue(normalizeDeviceId(deviceId)), tier: "plus", source, iat: now, exp: expiresAt };
}

export function makeAccountPayload(accountId: string, deviceId: string, source: string, expiresAt: number): PlusTokenPayload {
  const now = Date.now();
  return { sub: hashValue(`${accountId}:${normalizeDeviceId(deviceId)}`), tier: "plus", source, iat: now, exp: expiresAt };
}

export function parseAccessCodes() {
  const raw = process.env.PLUS_ACCESS_CODES || "{}";
  try {
    return JSON.parse(raw) as Record<string, { days?: number; months?: number; lifetime?: boolean; maxUses?: number; label?: string }>;
  } catch {
    throw new Error("PLUS_ACCESS_CODES must be valid JSON");
  }
}

export function referralCodeFor(subject: string) {
  return `EA-${hashValue(`ref:${subject}`).slice(0, 8).toUpperCase()}`;
}
