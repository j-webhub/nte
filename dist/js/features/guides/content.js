import { ALLOWED_TAGS, BLOCKED_TAGS, FONT_FAMILIES, FONT_SIZES } from "./config.js?v=20261020-searchable-pages";

export function createId() {
  return crypto.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

export function bytesOf(attachments = []) {
  return attachments.reduce((sum, attachment) => sum + Number(attachment.size || attachment.blob?.size || 0), 0);
}

export function safeVideoLinks(rawText) {
  return rawText
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        const url = new URL(line);
        return ["https:", "http:"].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function safeStyle(source) {
  const clean = {};
  const fontFamily = source.fontFamily?.replaceAll('"', "").replaceAll("'", "").trim();
  const fontSize = source.fontSize?.trim().toLowerCase();
  const color = source.color?.trim();
  if (FONT_FAMILIES.has(fontFamily)) clean.fontFamily = fontFamily;
  if (FONT_SIZES.has(fontSize)) clean.fontSize = fontSize;
  const validHexColor = /^#[\da-f]{3}(?:[\da-f]{3})?(?:[\da-f]{2})?$/i;
  const validRgbColor = /^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
  if (validHexColor.test(color || "") || validRgbColor.test(color || ""))
    clean.color = color;
  return clean;
}

export function sanitizeHtml(source) {
  const parsed = new DOMParser().parseFromString(String(source || ""), "text/html");
  const output = document.createDocumentFragment();
  const copyNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.append(document.createTextNode(node.nodeValue || ""));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tag)) return;
    if (!ALLOWED_TAGS.has(tag)) {
      [...node.childNodes].forEach((child) => copyNode(child, parent));
      return;
    }
    const element = document.createElement(tag);
    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      try {
        const url = new URL(href, location.href);
        if (["https:", "http:", "mailto:"].includes(url.protocol)) {
          element.href = url.href;
          element.target = "_blank";
          element.rel = "noopener noreferrer";
        }
      } catch {}
    }
    if (tag === "span") {
      const style = safeStyle(node.style);
      Object.entries(style).forEach(([property, value]) => {
        const cssProperty = property.replace(
          /[A-Z]/g,
          (letter) => "-" + letter.toLowerCase()
        );
        element.style.setProperty(cssProperty, value);
      });
    }
    [...node.childNodes].forEach((child) => copyNode(child, element));
    parent.append(element);
  };
  [...parsed.body.childNodes].forEach((node) => copyNode(node, output));
  return [...output.childNodes].map((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) return node.outerHTML;
    return esc(node.textContent || "");
  }).join("").replaceAll("\u200b", "");
}
