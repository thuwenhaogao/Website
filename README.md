# Wenhao Gao Academic Homepage v2

This is a clean static academic homepage for Wenhao Gao. It is intentionally separate from the existing `thuwenhaogao.github.io` repository.

## Local Preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create `thuwenhaogao/academic-homepage-v2`.
2. Push this repository to GitHub.
3. In GitHub repository settings, enable Pages from the `main` branch root.
4. The site should be available at `https://thuwenhaogao.github.io/academic-homepage-v2/`.

## Visitor Map

The site includes a Cloudflare Worker in `worker/`.

1. Install and authenticate Wrangler.
2. Create KV:

```bash
wrangler kv namespace create VISITS
```

3. Put the returned KV namespace id in `worker/wrangler.toml`.
4. Set a private salt:

```bash
wrangler secret put DEDUPE_SALT
```

5. Deploy:

```bash
cd worker
wrangler deploy
```

6. Copy the Worker URL into `assets/js/config.js` as `VISIT_API_BASE`.

The Worker aggregates visits by country and region. It uses a daily salted hash for de-duplication and does not store raw IP addresses.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.

