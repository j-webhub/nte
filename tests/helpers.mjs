import fs from "node:fs";
import { ASSET_VERSION } from "../dist/js/config/site.js";

export const importSite = file => import(new URL(`../dist/js/${file}?v=${ASSET_VERSION}`, import.meta.url));

export function fixtureFetch(overrides = {}) {
  return async url => {
    const relative = String(url).split("?")[0].replace(/^\.\//, "");
    if (relative in overrides) {
      const override = overrides[relative];
      return override === null ? { ok: false } : { ok: true, json: async () => structuredClone(override) };
    }
    const file = new URL("../dist/" + relative, import.meta.url);
    return { ok: true, json: async () => JSON.parse(fs.readFileSync(file, "utf8")) };
  };
}

// Only the DOM methods used by template rendering are needed here. Browser checks
// cover event dispatch and real layout; this stub keeps data/render checks portable.
export function installDom() {
  const nodes = new Map();
  const makeNode = () => ({
    innerHTML: "", value: "", textContent: "", dataset: {}, tagName: "BODY",
    querySelectorAll: () => [], querySelector: () => null,
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, append() {}, focus() {},
    classList: { add() {} }, style: { setProperty() {}, removeProperty() {} }
  });
  const getNode = selector => {
    if (!nodes.has(selector)) nodes.set(selector, makeNode());
    return nodes.get(selector);
  };
  globalThis.document = {
    querySelector: getNode, createElement: makeNode,
    documentElement: makeNode(), body: makeNode(), activeElement: makeNode(),
    addEventListener() {}
  };
  return getNode;
}
