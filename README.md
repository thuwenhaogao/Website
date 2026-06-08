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

The visitor map uses a SmallCounter world map widget generated for this site:
`https://smallcounter.com/map/view.php?type=1200&id=1780901141`.

1. Visit `https://smallcounter.com/map/`.
2. Copy the generated world map counter ID.
3. Paste it into `assets/js/config.js` as `SMALLCOUNTER_ID`.

Do not reuse another person's ID: that would display and record their website's visitor statistics.
If `SMALLCOUNTER_ID` is empty, the page shows a setup note instead of a fake visitor map.

## Image Credit

Tsinghua University Second Gate image: Wikimedia Commons, CC0.
