# Wenhao Gao Academic Homepage v2

This is a clean static academic homepage for Wenhao Gao. It is intentionally separate from the existing `thuwenhaogao.github.io` repository.

## Local Preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create or use `thuwenhaogao/Website`.
2. Push this repository to GitHub.
3. In GitHub repository settings, enable Pages from the `main` branch root.
4. The site should be available at `https://thuwenhaogao.github.io/Website/`.

## Visitor Map

The visitor map uses the MapMyVisitors globe widget generated for this site:
`https://mapmyvisitors.com/globe.js?d=NoozqEUH0WQO37gu4Z85KCgYh632LI_BMV5mNT4Bw8w`.
The public visitor statistics page is:
`https://mapmyvisitors.com/web/1c58n`.

1. Register or sign in at `https://mapmyvisitors.com/`.
2. Open the tracking code for `https://thuwenhaogao.github.io/Website/`.
3. Copy the generated tracking `d` value.
4. Paste it into `assets/js/config.js` as `MAPMYVISITORS_ID`.
5. Paste the public statistics page into `assets/js/config.js` as `MAPMYVISITORS_STATS_URL`.

Do not reuse another person's widget ID: that would display and record their website's visitor statistics.
If `MAPMYVISITORS_ID` is empty, the page shows a setup note instead of a fake visitor map.

## Visitor Flag Counter

The sample counter has been disconnected because it belongs to another website.
Only embed a new counter registered for this homepage; never reuse a reference counter's history.
The centered layout styles remain in `assets/css/styles.css` for the replacement.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.
