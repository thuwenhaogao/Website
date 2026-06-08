import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const mapId = "1780901141";
const projectRoot = new URL("../", import.meta.url);

function runHomepageScripts({ loadPublications = false } = {}) {
  const appended = [];
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

  return { appended, status, publicationsHtml: elements.get("publication-list").innerHTML };
}

test("injects the SmallCounter visitor map image widget", () => {
  const { appended, status } = runHomepageScripts();

  assert.equal(appended.length, 1);
  assert.equal(appended[0].tagName, "A");
  assert.equal(appended[0].href, `https://smallcounter.com/vmap/${mapId}/`);
  assert.equal(appended[0].target, "_blank");
  assert.equal(appended[0].rel, "noreferrer");

  assert.equal(appended[0].children.length, 1);
  const image = appended[0].children[0];
  assert.equal(image.tagName, "IMG");
  assert.equal(image.alt, "World map visitor counter");
  assert.equal(image.src, `https://smallcounter.com/map/view.php?type=1200&id=${mapId}`);
  assert.equal(status.textContent, "Loading visitor map...");
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
