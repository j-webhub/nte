import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const configPath = path.join(root, "dist/js/config/site.js");
const version = process.argv[2] || Date.now().toString(36);
if (!/^[a-zA-Z0-9_-]+$/.test(version)) {
  throw new Error("버전에는 영문·숫자·하이픈·밑줄만 사용할 수 있습니다.");
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const files = [
  ...walk(path.join(root, "dist/js")),
  path.join(root, "dist/styles.css"),
  path.join(root, "dist/index.html"),
  path.join(root, "templates/shell.html")
];
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  if (file === configPath) {
    text = text.replace(/ASSET_VERSION = "[^"]+"/, `ASSET_VERSION = "${version}"`);
  }
  if (file.endsWith(".js")) {
    text = text.replace(/((?:from\s*|import\s*)["'])(\.[^"']+)(["'])/g,
      (_, start, url, end) => start + url.split("?")[0] + "?v=" + version + end);
  } else if (file.endsWith(".css")) {
    text = text.replace(/(@import\s+["'])([^"']+)(["'])/g,
      (_, start, url, end) => start + url.split("?")[0] + "?v=" + version + end);
  } else {
    text = text.replace(/((?:src|href)=")([^"?]+\.(?:js|css))(?:\?[^" ]*)?(")/g,
      (_, start, url, end) => start + url + "?v=" + version + end);
  }
  fs.writeFileSync(file, text);
}
console.log(`자산·데이터 캐시 버전을 ${version}(으)로 갱신했습니다.`);
execFileSync(process.execPath,[path.join(root,"scripts/build-pages.mjs")],{stdio:"inherit"});
