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

  function buildMapMyVisitorsUrl(config) {
    const params = new URLSearchParams({
      d: config.MAPMYVISITORS_ID
    });

    return `https://mapmyvisitors.com/globe.js?${params.toString()}`;
  }

  function updateMapMyVisitorsLink(container, statsUrl) {
    if (!statsUrl) return;

    const link = container.querySelector("#mmvst_a");
    if (!link) return false;

    link.href = statsUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.title = "View visitor statistics";
    return true;
  }

  function watchMapMyVisitorsLink(container, statsUrl) {
    if (!statsUrl || typeof MutationObserver === "undefined") return null;

    const observer = new MutationObserver(() => {
      if (updateMapMyVisitorsLink(container, statsUrl)) {
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    return observer;
  }

  function initVisitorMap() {
    const container = document.getElementById("visitor-map-container");
    const status = document.getElementById("map-status");
    const config = window.SITE_CONFIG || {};

    if (!container || !status) return;
    if (!config.MAPMYVISITORS_ID) {
      status.hidden = false;
      status.textContent = "Paste your MapMyVisitors widget ID in assets/js/config.js to activate the live visitor map.";
      return;
    }

    status.hidden = false;
    status.textContent = "Loading visitor map...";
    watchMapMyVisitorsLink(container, config.MAPMYVISITORS_STATS_URL);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "mmvst_globe";
    script.async = true;
    script.src = buildMapMyVisitorsUrl(config);
    script.onload = () => {
      status.remove();
      updateMapMyVisitorsLink(container, config.MAPMYVISITORS_STATS_URL);
    };
    script.onerror = () => {
      status.textContent = "Visitor map could not load right now.";
    };
    container.append(script);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderPublications();
    initVisitorMap();
  });
}());
