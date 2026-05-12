(function () {
  const COUNTRY_POINTS = {
    AU: { name: "Australia", lat: -25.27, lon: 133.78 },
    BR: { name: "Brazil", lat: -14.24, lon: -51.93 },
    CA: { name: "Canada", lat: 56.13, lon: -106.35 },
    CH: { name: "Switzerland", lat: 46.82, lon: 8.23 },
    CN: { name: "China", lat: 35.86, lon: 104.2 },
    DE: { name: "Germany", lat: 51.17, lon: 10.45 },
    ES: { name: "Spain", lat: 40.46, lon: -3.75 },
    FR: { name: "France", lat: 46.23, lon: 2.21 },
    GB: { name: "United Kingdom", lat: 55.38, lon: -3.44 },
    HK: { name: "Hong Kong", lat: 22.32, lon: 114.17 },
    ID: { name: "Indonesia", lat: -0.79, lon: 113.92 },
    IN: { name: "India", lat: 20.59, lon: 78.96 },
    IT: { name: "Italy", lat: 41.87, lon: 12.57 },
    JP: { name: "Japan", lat: 36.2, lon: 138.25 },
    KR: { name: "South Korea", lat: 35.91, lon: 127.77 },
    MY: { name: "Malaysia", lat: 4.21, lon: 101.98 },
    NL: { name: "Netherlands", lat: 52.13, lon: 5.29 },
    NZ: { name: "New Zealand", lat: -40.9, lon: 174.89 },
    PH: { name: "Philippines", lat: 12.88, lon: 121.77 },
    SE: { name: "Sweden", lat: 60.13, lon: 18.64 },
    SG: { name: "Singapore", lat: 1.35, lon: 103.82 },
    TH: { name: "Thailand", lat: 15.87, lon: 100.99 },
    TW: { name: "Taiwan", lat: 23.7, lon: 120.96 },
    US: { name: "United States", lat: 37.09, lon: -95.71 },
    VN: { name: "Vietnam", lat: 14.06, lon: 108.28 }
  };

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

  function projectPoint(lat, lon) {
    return {
      x: ((lon + 180) / 360) * 960,
      y: ((90 - lat) / 180) * 480
    };
  }

  function topRegions(regions) {
    if (!Array.isArray(regions) || regions.length === 0) return "—";
    return regions
      .slice(0, 3)
      .map((region) => `${region.region || "Unknown"} (${region.count})`)
      .join(", ");
  }

  function renderVisitorData(payload) {
    const points = document.getElementById("visitor-points");
    const tableWrap = document.getElementById("visit-table-wrap");
    const tableBody = document.getElementById("visit-table-body");
    const status = document.getElementById("map-status");
    const countries = Array.isArray(payload.countries) ? payload.countries : [];

    if (!points || !tableWrap || !tableBody || !status) return;
    points.innerHTML = "";
    tableBody.innerHTML = "";

    if (countries.length === 0) {
      status.textContent = "No aggregated visits have been recorded yet.";
      tableWrap.hidden = true;
      return;
    }

    const maxCount = countries.reduce((max, country) => Math.max(max, country.count || 0), 1);
    countries.forEach((country) => {
      const code = String(country.country || "").toUpperCase();
      const location = COUNTRY_POINTS[code];
      const count = Number(country.count || 0);
      const name = country.name || location?.name || code;

      if (location) {
        const projected = projectPoint(location.lat, location.lon);
        const radius = 5 + Math.sqrt(count / maxCount) * 15;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "visitor-dot");
        circle.setAttribute("cx", projected.x);
        circle.setAttribute("cy", projected.y);
        circle.setAttribute("r", radius.toFixed(1));

        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `${name}: ${count} visit${count === 1 ? "" : "s"}`;
        circle.append(title);
        points.append(circle);

        if (count === maxCount) {
          const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
          label.setAttribute("class", "visitor-label");
          label.setAttribute("x", projected.x + radius + 5);
          label.setAttribute("y", projected.y + 4);
          label.textContent = name;
          points.append(label);
        }
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(name)}</td>
        <td>${count}</td>
        <td>${escapeHtml(topRegions(country.regions))}</td>
      `;
      tableBody.append(row);
    });

    status.textContent = "Showing aggregated visits by country and region. Raw IP addresses are not stored.";
    tableWrap.hidden = false;
  }

  async function initVisitorMap() {
    const status = document.getElementById("map-status");
    const base = (window.SITE_CONFIG?.VISIT_API_BASE || "").replace(/\/$/, "");

    if (!status) return;
    if (!base) {
      status.textContent = "Visitor map will activate after the Cloudflare Worker endpoint is configured in assets/js/config.js.";
      return;
    }

    try {
      await fetch(`${base}/api/visit`, { method: "POST", mode: "cors", keepalive: true });
      const response = await fetch(`${base}/api/visits`, { mode: "cors" });
      if (!response.ok) throw new Error(`Visitor API returned ${response.status}`);
      renderVisitorData(await response.json());
    } catch (error) {
      status.textContent = "Visitor map could not load right now.";
      console.warn(error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderPublications();
    initVisitorMap();
  });
}());

