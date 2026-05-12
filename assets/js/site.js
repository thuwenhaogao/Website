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

  function renderClustrMapsSetup(container, status) {
    container.classList.add("needs-clustrmaps-id");
    status.hidden = false;
    status.innerHTML = `
      <span>ClustrMaps is installed. Add your site <code>d</code> value in <code>assets/js/config.js</code> to activate the live map.</span>
    `;
  }

  function initClustrMaps() {
    const container = document.getElementById("clustrmaps-container");
    const status = document.getElementById("map-status");
    const config = window.SITE_CONFIG || {};

    if (!container || !status) return;
    if (!config.CLUSTRMAPS_ID) {
      renderClustrMapsSetup(container, status);
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
    };
    script.onerror = () => {
      status.textContent = "Visitor map could not load right now.";
    };
    container.append(script);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderPublications();
    initClustrMaps();
  });
}());
