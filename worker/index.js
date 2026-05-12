const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...CORS_HEADERS,
      ...(init.headers || {})
    }
  });
}

function normalizeCountry(value) {
  const country = String(value || "XX").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : "XX";
}

function normalizeRegion(value) {
  const region = String(value || "Unknown").trim();
  return region.slice(0, 80) || "Unknown";
}

async function sha256Hex(value) {
  const input = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getJson(kv, key, fallback) {
  const value = await kv.get(key, "json");
  return value || fallback;
}

function sortedRegions(regions) {
  return Object.entries(regions || {})
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region));
}

async function handleVisit(request, env) {
  if (!env.VISITS) {
    return json({ error: "VISITS KV binding is not configured" }, { status: 500 });
  }

  const country = normalizeCountry(request.cf?.country || request.headers.get("CF-IPCountry"));
  const region = normalizeRegion(request.cf?.region || request.cf?.regionCode || request.headers.get("X-Visitor-Region"));
  const date = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const userAgent = request.headers.get("User-Agent") || "";
  const salt = env.DEDUPE_SALT || "change-this-salt";
  const visitorHash = await sha256Hex(`${salt}:${date}:${country}:${ip}:${userAgent}`);
  const dedupeKey = `dedupe:${date}:${visitorHash}`;

  const seen = await env.VISITS.get(dedupeKey);
  if (seen) {
    return json({ ok: true, deduped: true });
  }

  await env.VISITS.put(dedupeKey, "1", { expirationTtl: 60 * 60 * 48 });

  const data = await getJson(env.VISITS, "visits:countries", {
    updatedAt: null,
    countries: {}
  });

  const entry = data.countries[country] || {
    country,
    count: 0,
    regions: {}
  };

  entry.count += 1;
  entry.regions[region] = (entry.regions[region] || 0) + 1;
  data.countries[country] = entry;
  data.updatedAt = new Date().toISOString();

  await env.VISITS.put("visits:countries", JSON.stringify(data));
  return json({ ok: true, deduped: false });
}

async function handleVisits(env) {
  if (!env.VISITS) {
    return json({ error: "VISITS KV binding is not configured" }, { status: 500 });
  }

  const data = await getJson(env.VISITS, "visits:countries", {
    updatedAt: null,
    countries: {}
  });

  const countries = Object.values(data.countries || {})
    .map((entry) => ({
      country: entry.country,
      count: entry.count || 0,
      regions: sortedRegions(entry.regions)
    }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));

  return json({
    updatedAt: data.updatedAt,
    countries
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/visit" && request.method === "POST") {
      return handleVisit(request, env);
    }

    if (url.pathname === "/api/visits" && request.method === "GET") {
      return handleVisits(env);
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};

