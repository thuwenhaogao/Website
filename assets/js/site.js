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

  function renderPublicationNote(note) {
    if (!note) return "";
    return `<span class="publication-note">${escapeHtml(note)}</span>`;
  }

  function renderPublications() {
    const list = document.getElementById("publication-list");
    if (!list || !Array.isArray(window.PUBLICATIONS)) return;

    list.innerHTML = window.PUBLICATIONS.map((pub) => `
      <li${pub.featured ? ' class="publication-featured"' : ""}>
        <span class="publication-title">${escapeHtml(pub.title)}</span>
        <span class="publication-meta">
          <span class="publication-authors">${highlightAuthor(pub.authors)}</span>
          ${renderPublicationNote(pub.note)}
        </span>
        <span class="publication-venue">${escapeHtml(pub.venue)}, ${escapeHtml(pub.year)}</span>
      </li>
    `).join("");
  }

  function buildSmallCounterMapUrl(config) {
    const params = new URLSearchParams({
      type: String(config.SMALLCOUNTER_MAP_TYPE || 180),
      id: config.SMALLCOUNTER_ID
    });

    return `https://smallcounter.com/map/view.php?${params.toString()}`;
  }

  function buildSmallCounterStatsUrl(config) {
    return `https://smallcounter.com/vmap/${encodeURIComponent(config.SMALLCOUNTER_ID)}/`;
  }

  function initVisitorMap() {
    const container = document.getElementById("visitor-map-container");
    const status = document.getElementById("map-status");
    const config = window.SITE_CONFIG || {};

    if (!container || !status) return;
    if (!config.SMALLCOUNTER_ID) {
      status.hidden = false;
      status.textContent = "Paste your SmallCounter map ID in assets/js/config.js to activate the live visitor map.";
      return;
    }

    status.hidden = false;
    status.textContent = "Loading visitor map...";

    const link = document.createElement("a");
    link.title = "Free world map tracker";
    link.href = buildSmallCounterStatsUrl(config);
    link.target = "_blank";
    link.rel = "noreferrer";

    const image = document.createElement("img");
    image.title = "Free world map counter";
    image.alt = "World map visitor counter";
    image.border = "1";
    image.src = buildSmallCounterMapUrl(config);
    image.onload = () => {
      status.remove();
    };
    image.onerror = () => {
      status.textContent = "Visitor map could not load right now.";
    };
    link.append(image);
    container.append(link);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderPublications();
    initVisitorMap();
  });
}());
