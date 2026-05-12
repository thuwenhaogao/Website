# Wenhao Gao Academic Homepage v2

This is a clean static academic homepage for Wenhao Gao. It is intentionally separate from the existing `thuwenhaogao.github.io` repository.

## Local Preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create or use `thuwenhaogao/Website-V2`.
2. Push this repository to GitHub.
3. In GitHub repository settings, enable Pages from the `main` branch root.
4. The site should be available at `https://thuwenhaogao.github.io/Website-V2/`.

## Visitor Map

The visitor map uses Leaflet on the homepage and an optional Cloudflare Worker backend for approximate visitor locations.

1. Deploy `worker/` to Cloudflare Workers.
2. Create a KV namespace and bind it as `VISITS_KV`.
3. Copy `worker/wrangler.toml.example` to `worker/wrangler.toml` and fill in the KV namespace id plus `IP_HASH_SALT`.
4. Paste the Worker URL into `assets/js/config.js` as `VISITOR_API_BASE_URL`.

The Worker aggregates city/region/country-level locations. Raw IP addresses are used only to compute a daily salted hash for deduplication and are not stored.
If `VISITOR_API_BASE_URL` is empty, the page shows demo visitor locations around Beijing, Hong Kong, Guangzhou, and Shenzhen.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.
