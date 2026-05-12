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

The visitor map uses the ClustrMaps widget generated for this site:
`//clustrmaps.com/globe.js?d=3sRWfULsHC2PGDTchLeuZ4J8Ljs5NZBTJ_k2mXU0Tpo`.

1. Create a ClustrMaps widget for this website.
2. Copy the widget's `d` value.
3. Paste it into `assets/js/config.js` as `CLUSTRMAPS_ID`.

Do not reuse another person's `d` value: that would display and record their website's visitor statistics.
If `CLUSTRMAPS_ID` is empty, the page shows a setup note instead of a fake visitor map.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.
