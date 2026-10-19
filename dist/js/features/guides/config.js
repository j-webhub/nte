export const DATABASE_NAME = "nte-archive-guide-board";
export const DATABASE_VERSION = 1;
export const STORE_NAME = "posts";
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_POST_MEDIA_BYTES = 300 * 1024 * 1024;
export const MAX_BACKUP_BYTES = 500 * 1024 * 1024;
export const MAX_MANIFEST_BYTES = 50 * 1024 * 1024;
export const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "div",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "a"
]);
export const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "svg",
  "math",
  "template"
]);
export const FONT_FAMILIES = new Set([
  "Pretendard",
  "Noto Sans KR",
  "Malgun Gothic",
  "serif",
  "monospace"
]);
export const FONT_SIZES = new Set(["12px", "14px", "16px", "18px", "22px", "28px"]);
