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

  function normalizeApiUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function setMapStatus(message) {
    const status = document.getElementById("map-status");
    if (!status) return;
    status.hidden = !message;
    status.textContent = message || "";
  }

  function validPoint(point) {
    return Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude));
  }

  function pointLabel(point) {
    if (point.label) return point.label;
    return [point.city, point.region, point.countryCode].filter(Boolean).join(", ") || "Visitor";
  }

  function markerRadius(count) {
    return Math.min(12, 5 + Math.sqrt(Math.max(1, Number(count) || 1)) * 2);
  }

  function renderLeafletMap(points, message) {
    const mapElement = document.getElementById("visitor-map");
    if (!mapElement || !window.L) {
      setMapStatus("Visitor map could not load right now.");
      return;
    }

    mapElement.replaceChildren();
    const map = L.map(mapElement, {
      attributionControl: true,
      zoomControl: true,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      scrollWheelZoom: false,
      worldCopyJump: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 0.85
    }).setView([18, 45], 1.25);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 8,
      minZoom: 1,
      noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    points.filter(validPoint).forEach((point) => {
      const lat = Number(point.latitude);
      const lng = Number(point.longitude);
      L.circleMarker([lat, lng], {
        radius: markerRadius(point.count),
        color: "#ffffff",
        weight: 1.5,
        fillColor: point.color || "#9d879f",
        fillOpacity: 0.82
      })
        .bindTooltip(`${pointLabel(point)}${point.count ? ` · ${point.count}` : ""}`, {
          direction: "top",
          opacity: 0.95
        })
        .addTo(map);
    });

    setMapStatus(message);
    window.setTimeout(() => map.invalidateSize(), 50);
  }

  async function fetchVisitorPoints(apiBaseUrl) {
    const visitUrl = `${apiBaseUrl}/api/visit`;
    const visitsUrl = `${apiBaseUrl}/api/visits`;
    await fetch(visitUrl, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || ""
      })
    });

    const response = await fetch(visitsUrl, { mode: "cors", cache: "no-store" });
    if (!response.ok) throw new Error("Visitor API request failed.");
    const data = await response.json();
    return Array.isArray(data.points) ? data.points : [];
  }

  async function initVisitorMap() {
    const config = window.SITE_CONFIG || {};
    const apiBaseUrl = normalizeApiUrl(config.VISITOR_API_BASE_URL);
    const demoPoints = Array.isArray(config.DEMO_VISITOR_POINTS) ? config.DEMO_VISITOR_POINTS : [];

    if (!apiBaseUrl) {
      renderLeafletMap(
        config.SHOW_DEMO_VISITS === false ? [] : demoPoints,
        config.SHOW_DEMO_VISITS === false
          ? "Configure the Visitor Worker URL to show live approximate visitor locations."
          : "Demo visitor locations are shown until the Visitor Worker URL is configured."
      );
      return;
    }

    try {
      const points = await fetchVisitorPoints(apiBaseUrl);
      renderLeafletMap(
        points.length ? points : demoPoints,
        points.length
          ? "Showing approximate visitor locations aggregated by city and region."
          : "No live visitor locations recorded yet; demo locations are shown for preview."
      );
    } catch (error) {
      renderLeafletMap(demoPoints, "Visitor API is not reachable right now; demo locations are shown for preview.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderPublications();
    initVisitorMap();
  });
}());
