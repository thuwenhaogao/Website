(function () {
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function highlightAuthor(authors) {
    return escapeHtml(authors).replace(/\bW\. Gao\b/g, "<strong>W. Gao</strong>");
  }

  function renderPublications() {
    const list = document.getElementById("publication-list");
    if (!list || !Array.isArray(window.PUBLICATIONS)) return;

    list.innerHTML = window.PUBLICATIONS.map((pub) => `
      <li>
        <span class="publication-title">${escapeHtml(pub.title)}</span>
        <span class="publication-meta">${highlightAuthor(pub.authors)}</span>
        <span class="publication-venue">${escapeHtml(pub.venue)}, ${escapeHtml(pub.year)}</span>
      </li>
    `).join("");
  }

  function buildClustrMapsUrl(config) {
    const id = config.CLUSTRMAPS_ID;
    const options = config.CLUSTRMAPS_OPTIONS || {};
    const params = new URLSearchParams({
      cl: options.color || "dbdbdb",
      w: String(options.width || 300),
      t: options.text || "n",
      d: id,
      co: options.background || "ffffff",
      cmo: options.markerOld || "a7c1a9",
      cmn: options.markerNew || "0b6f6a"
    });

    return `https://cdn.clustrmaps.com/map_v2.js?${params.toString()}`;
  }

  function projectPoint(latitude, longitude) {
    return {
      x: ((Number(longitude) + 180) / 360) * 960,
      y: ((90 - Number(latitude)) / 180) * 480
    };
  }

  function createSvgElement(tag, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function createWorldMapSvg(points) {
    const svg = createSvgElement("svg", {
      class: "fallback-world-map",
      viewBox: "0 0 960 480",
      role: "img",
      "aria-label": "Demo global visitor map"
    });
    const title = createSvgElement("title");
    title.textContent = "Demo global visitor map";
    svg.append(title);

    const map = createSvgElement("g", { class: "fallback-land" });
    [
      "M88 138l32-30 62-20 78 20 50 42-18 38-45 12-30 35-58-18-32-30z",
      "M236 54l46-24 72 22 34 36-31 28-74-2-36-24z",
      "M260 236l48 22 28 62-26 92-42 36-34-74 8-70z",
      "M462 122l42-28 72-10 90 14 72-4 96 42 54 54-42 42-88 8-72-38-70 38-82-12-42-56z",
      "M530 238l90 12 46 70-34 96-70-34-44-78z",
      "M718 256l70 16 34 42-44 42-70-14-30-48z",
      "M820 304l66 12 46 38-62 30-70-28z",
      "M604 58l58-34 94 18 30 28-60 24-82-4z",
      "M432 164l28-34 44 10-8 46-48 10z",
      "M804 190l28-16 36 18-16 26-40-2z"
    ].forEach((d) => {
      map.append(createSvgElement("path", { d }));
    });
    svg.append(map);

    const visitors = createSvgElement("g", { class: "fallback-visitors" });
    points.forEach((point) => {
      const { x, y } = projectPoint(point.latitude, point.longitude);
      const circle = createSvgElement("circle", {
        cx: (x + (point.offsetX || 0)).toFixed(2),
        cy: (y + (point.offsetY || 0)).toFixed(2),
        r: point.radius || 8
      });
      const pointTitle = createSvgElement("title");
      pointTitle.textContent = point.label;
      circle.append(pointTitle);
      visitors.append(circle);
    });
    svg.append(visitors);
    return svg;
  }

  function renderFallbackVisitorMap(container, config, reason) {
    const points = config.SHOW_DEMO_VISITS === false ? [] : (config.DEMO_VISITOR_POINTS || []);
    container.className = "clustrmaps-container is-fallback";
    container.replaceChildren(createWorldMapSvg(points));

    const note = document.createElement("p");
    note.className = "map-demo-note";
    note.textContent = points.length
      ? "Demo visitor points are shown until the live ClustrMaps ID is configured."
      : (reason || "The live visitor map will appear after ClustrMaps is configured.");
    container.append(note);
  }

  function hasLiveClustrMapsContent(container) {
    return Boolean(container.querySelector("iframe, canvas, img, a[href*='clustrmaps']"));
  }

  function initClustrMaps() {
    const container = document.getElementById("clustrmaps-container");
    const status = document.getElementById("map-status");
    const config = window.SITE_CONFIG || {};

    if (!container || !status) return;
    if (!config.CLUSTRMAPS_ID) {
      renderFallbackVisitorMap(container, config);
      return;
    }

    container.classList.add("is-live");
    status.hidden = false;
    status.textContent = "Loading visitor map...";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "clustrmaps";
    script.async = true;
    script.src = buildClustrMapsUrl(config);
    script.onload = () => {
      status.remove();
      window.setTimeout(() => {
        if (!hasLiveClustrMapsContent(container)) {
          renderFallbackVisitorMap(container, config, "The live visitor map is not available yet.");
        }
      }, 1800);
    };
    script.onerror = () => {
      renderFallbackVisitorMap(container, config, "Visitor map could not load right now.");
    };
    container.append(script);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderPublications();
    initClustrMaps();
  });
}());
