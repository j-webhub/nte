import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../dist");
const port = Number(process.env.PORT || 8765);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname).replace(/^\/nte(?=\/|$)/,"") || "/";
    let file = path.resolve(root, "." + pathname);
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if ((await fs.stat(file)).isDirectory()) file=path.join(file,"index.html");
    const contents = await fs.readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 400).end("파일을 열 수 없습니다.");
  }
});
server.on("error", error => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}/nte/`));
process.on("SIGINT", () => server.close(() => process.exit(0)));
