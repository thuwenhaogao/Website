import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const mapId = "d2fevBEtCWSp9hCUCxU_Fh9ujHfTnZOcJezj8WSyun8";
const projectRoot = new URL("../", import.meta.url);

function runHomepageScripts({ loadPublications = false } = {}) {
  const appended = [];
  const mutationObservers = [];
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      this.observed = null;
      mutationObservers.push(this);
    }

    disconnect() {
      this.disconnected = true;
    }

    observe(target, options) {
      this.observed = { target, options };
    }
  }
  function findById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const found = findById(child, id);
      if (found) return found;
    }
    return null;
  }
  function createElement(tagName) {
    return {
      alt: "",
      async: false,
      border: "",
      children: [],
      className: "",
      href: "",
      id: "",
      rel: "",
      src: "",
      tagName: tagName.toUpperCase(),
      target: "",
      title: "",
      type: "",
      append(node) {
        this.children.push(node);
      }
    };
  }
  const status = {
    hidden: true,
    removed: false,
    textContent: "",
    remove() {
      this.removed = true;
    }
  };
  const container = {
    children: [],
    append(node) {
      this.children.push(node);
      appended.push(node);
    },
    querySelector(selector) {
      if (selector === "#mmvst_a") return findById(this, "mmvst_a");
      return null;
    }
  };
  const elements = new Map([
    ["year", { textContent: "" }],
    ["publication-list", { innerHTML: "" }],
    ["visitor-map-container", container],
    ["map-status", status]
  ]);
  const document = {
    addEventListener(eventName, handler) {
      if (eventName === "DOMContentLoaded") handler();
    },
    createElement,
    getElementById(id) {
      return elements.get(id) || null;
    }
  };
  const context = {
    document,
    MutationObserver,
    URLSearchParams,
    window: {
      PUBLICATIONS: []
    }
  };

  vm.createContext(context);
  vm.runInContext(readFileSync(new URL("assets/js/config.js", projectRoot), "utf8"), context);
  if (loadPublications) {
    vm.runInContext(readFileSync(new URL("assets/js/publications.js", projectRoot), "utf8"), context);
  }
  vm.runInContext(readFileSync(new URL("assets/js/site.js", projectRoot), "utf8"), context);

  return { appended, container, mutationObservers, status, publicationsHtml: elements.get("publication-list").innerHTML };
}

test("injects the MapMyVisitors globe widget script", () => {
  const { appended, status } = runHomepageScripts();

  assert.equal(appended.length, 1);
  assert.equal(appended[0].tagName, "SCRIPT");
  assert.equal(appended[0].type, "text/javascript");
  assert.equal(appended[0].id, "mmvst_globe");
  assert.equal(appended[0].async, true);
  assert.equal(appended[0].src, `https://mapmyvisitors.com/globe.js?d=${mapId}`);
  assert.equal(status.textContent, "Loading visitor map...");
});

test("keeps the MapMyVisitors globe visible with a muted blue-purple treatment", () => {
  const css = readFileSync(new URL("assets/css/styles.css", projectRoot), "utf8");

  assert.match(css, /\.visitor-map-container \.mmvst_outer #mmvst_a \.mmvst_inner/);
  assert.match(css, /display: block !important;/);
  assert.match(css, /filter: saturate\(0\.54\) hue-rotate\(28deg\) brightness\(1\.1\) contrast\(0\.88\);/);
});

test("redirects the generated MapMyVisitors globe link to the public visitor statistics", () => {
  const { appended, container } = runHomepageScripts();
  const generatedLink = createGeneratedMapLink();

  container.append(generatedLink);
  appended[0].onload();

  assert.equal(generatedLink.href, "https://mapmyvisitors.com/web/1c58n");
  assert.equal(generatedLink.target, "_blank");
  assert.equal(generatedLink.rel, "noreferrer");
  assert.equal(generatedLink.title, "View visitor statistics");
});

test("redirects the MapMyVisitors globe link when the widget renders after script load", () => {
  const { appended, container, mutationObservers } = runHomepageScripts();
  const generatedLink = createGeneratedMapLink();

  appended[0].onload();
  container.append(generatedLink);
  mutationObservers[0].callback();

  assert.equal(generatedLink.href, "https://mapmyvisitors.com/web/1c58n");
  assert.equal(generatedLink.target, "_blank");
  assert.equal(generatedLink.rel, "noreferrer");
  assert.equal(generatedLink.title, "View visitor statistics");
  assert.equal(mutationObservers[0].disconnected, true);
});

test("renders the accepted IEEE TTE paper first with co-first author marking", () => {
  const { publicationsHtml } = runHomepageScripts({ loadPublications: true });

  assert.match(
    publicationsHtml,
    /<li class="publication-featured">\s*<span class="publication-title">Integrated Planning of Urban Distribution Network and Multi-Charging Infrastructures with Smart Transportation System<\/span>/
  );
  assert.match(
    publicationsHtml,
    /<span class="publication-meta">\s*<span class="publication-authors">Y\. Wang, <strong>W\. Gao<\/strong>, X\. Shen<\/span>\s*<span class="publication-note">co-first author<\/span>\s*<\/span>/
  );
  assert.match(publicationsHtml, /IEEE Transactions on Transportation Electrification, 2026/);
  assert.match(publicationsHtml, /<span class="publication-note">co-first author<\/span>/);
  assert.doesNotMatch(publicationsHtml, /SSRN 6017254/);
});

function createGeneratedMapLink() {
  return {
    children: [],
    href: "//mapmyvisitors.com",
    id: "mmvst_a",
    rel: "",
    target: "",
    title: "",
    append(node) {
      this.children.push(node);
    }
  };
}
