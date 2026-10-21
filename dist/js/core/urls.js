import { SITE_URL } from "../config/site.js?v=20261021-akane-level80";

export const SITE_PATH = new URL(SITE_URL).pathname;
export const CHARACTER_TABS = new Set(["overview", "skills", "awakening", "arcs", "console", "growth"]);

export function pagePath(view = "home", id = "", tab = "overview") {
  if (view === "home") return SITE_PATH;
  let path = SITE_PATH + encodeURIComponent(view) + "/";
  if (id) path += encodeURIComponent(id) + "/";
  if (view === "characters" && id && tab !== "overview" && CHARACTER_TABS.has(tab)) path += tab + "/";
  return path;
}

export function readRoute(address) {
  const legacy = address.hash.startsWith("#") && address.hash.length > 1;
  const parts = legacy ? address.hash.slice(1).split("/") : address.pathname.slice(SITE_PATH.length).split("/");
  try {
    return { view: decodeURIComponent(parts[0] || "home"), id: decodeURIComponent(parts[1] || ""),
      tab: CHARACTER_TABS.has(parts[2]) ? parts[2] : "overview", legacy };
  } catch { return { view: "home", id: "", tab: "overview", legacy }; }
}

export function isPlainClick(event) {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}
