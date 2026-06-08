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

The visitor map uses a MapMyVisitors globe widget generated for this site:
`https://mapmyvisitors.com/globe.js?d=d2fevBEtCWSp9hCUCxU_Fh9ujHfTnZOcJezj8WSyun8`.

1. Register or sign in at `https://mapmyvisitors.com/`.
2. Create a globe widget for `https://thuwenhaogao.github.io/Website/`.
3. Copy the generated widget `d` value.
4. Paste it into `assets/js/config.js` as `MAPMYVISITORS_ID`.

Do not reuse another person's widget ID: that would display and record their website's visitor statistics.
If `MAPMYVISITORS_ID` is empty, the page shows a setup note instead of a fake visitor map.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.
