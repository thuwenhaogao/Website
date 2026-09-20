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

A centered Flag Counter below the globe uses `ICvQ` on `s05.flagcounter.com`,
newly registered on September 21, 2026 (Asia/Singapore) for Wenhao Gao's homepage:
`https://thuwenhaogao.github.io/Website/`.
The official statistics link is `https://info.flagcounter.com/ICvQ`.
It starts a new visitor history and does not import another website's statistics.
The registration preview itself can contribute the initial visit.

The image shows up to eight countries or regions in a single row on all screen sizes.
Only places with recorded visits appear; eight columns do not create eight flags.
According to the [official FAQ](https://flagcounter.com/faq.html), statistics pages update in
real time, while the free counter image is delayed by approximately five minutes.
An already-open page does not replace its image automatically. The **Refresh flags** button
requests the latest available image without reloading the page, and **Live statistics** opens
the real-time details. Refreshing cannot bypass the provider's image-generation delay.
There is no automatic polling: each image request adds a counter pageview.
Its image URLs and statistics link are in `index.html`; layout styles are in `assets/css/styles.css`.
Keep this counter's code on this homepage only. Any other page embedding the same counter can
also contribute visits; it is not locked to a single domain. Local preview and QA visits can count too.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.
