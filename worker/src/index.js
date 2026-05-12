const FALLBACK_COORDS = {
  CN: { latitude: 35.8617, longitude: 104.1954 },
  HK: { latitude: 22.3193, longitude: 114.1694 },
  SG: { latitude: 1.3521, longitude: 103.8198 },
  US: { latitude: 39.8283, longitude: -98.5795 }
};

function jsonResponse(data, env, request, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(env, request),
      ...(init.headers || {})
    }
  });
}

function corsHeaders(env, request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "https://thuwenhaogao.github.io";
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "access-control-allow-origin": origin === allowedOrigin || isLocal ? origin : allowedOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400"
  };
}

function getClientIp(request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

function dateKey() {
  return new Date().toISOString().slice(0, 10);
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cleanSegment(value, fallback) {
  return String(value || fallback || "Unknown")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5 ._-]/g, "")
    .trim()
    .slice(0, 80) || "Unknown";
}

function locationFromRequest(request) {
  const cf = request.cf || {};
  const countryCode = cleanSegment(cf.country, "XX").toUpperCase();
  const fallback = FALLBACK_COORDS[countryCode] || { latitude: 0, longitude: 0 };
  const latitude = Number(cf.latitude ?? fallback.latitude);
  const longitude = Number(cf.longitude ?? fallback.longitude);
  const city = cleanSegment(cf.city, "");
  const region = cleanSegment(cf.region, "");
  const label = [city, region, countryCode].filter(Boolean).join(", ") || countryCode;

  return {
    key: [countryCode, region || "unknown-region", city || "unknown-city"].map((part) => cleanSegment(part, "unknown")).join(":"),
    label,
    city,
    region,
    countryCode,
    latitude,
    longitude
  };
}

async function handleVisit(request, env) {
  const ip = getClientIp(request);
  const salt = env.IP_HASH_SALT || "change-this-salt";
  const hashedIp = await sha256Hex(`${dateKey()}:${salt}:${ip}`);
  const seenKey = `seen:${dateKey()}:${hashedIp}`;

  if (await env.VISITS_KV.get(seenKey)) {
    return jsonResponse({ ok: true, deduped: true }, env, request);
  }

  const location = locationFromRequest(request);
  const pointKey = `point:${location.key}`;
  const existing = await env.VISITS_KV.get(pointKey, "json");
  const next = {
    ...location,
    count: Number(existing?.count || 0) + 1,
    firstSeen: existing?.firstSeen || new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };

  await env.VISITS_KV.put(pointKey, JSON.stringify(next));
  await env.VISITS_KV.put(seenKey, "1", { expirationTtl: 60 * 60 * 36 });
  return jsonResponse({ ok: true, point: next }, env, request);
}

async function handleVisits(request, env) {
  const list = await env.VISITS_KV.list({ prefix: "point:", limit: 1000 });
  const points = await Promise.all(list.keys.map((key) => env.VISITS_KV.get(key.name, "json")));
  const visiblePoints = points
    .filter(Boolean)
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, 250);

  return jsonResponse({ points: visiblePoints, updatedAt: new Date().toISOString() }, env, request);
}

export default {
  async fetch(request, env) {
    if (!env.VISITS_KV) {
      return jsonResponse({ error: "VISITS_KV binding is missing." }, env, request, { status: 500 });
    }

    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }
    if (url.pathname === "/api/visit" && request.method === "POST") {
      return handleVisit(request, env);
    }
    if (url.pathname === "/api/visits" && request.method === "GET") {
      return handleVisits(request, env);
    }
    return jsonResponse({ error: "Not found." }, env, request, { status: 404 });
  }
};
