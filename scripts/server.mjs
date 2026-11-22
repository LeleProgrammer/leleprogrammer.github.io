import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".map": "application/json"
};

function sendFile(req, res, filePath) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }

  const etag = '"' + stat.size.toString(16) + "-" + Math.floor(stat.mtimeMs).toString(16) + '"';
  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304, { ETag: etag, "Cache-Control": "no-cache" });
    res.end();
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[extension] || "application/octet-stream",
    "Cache-Control": "no-cache",
    ETag: etag,
    "Last-Modified": stat.mtime.toUTCString()
  });
  fs.createReadStream(filePath).pipe(res);
}

function sendNotFound(res, distRoot) {
  const notFound = path.join(distRoot, "404.html");
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(notFound).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
}

export function createStaticServer(options) {
  const { distRoot, extraHandler = null } = options;
  const resolvedRoot = path.resolve(distRoot);

  return http.createServer((req, res) => {
    let url;
    try {
      url = new URL(req.url, "http://localhost");
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    if (extraHandler && extraHandler(req, res, url) === true) return;

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    if (pathname.includes("\0")) {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    const relative = pathname.replace(/^\/+/, "");
    const target = path.resolve(resolvedRoot, relative);
    if (target !== resolvedRoot && !target.startsWith(resolvedRoot + path.sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const candidates = [];
    if (pathname.endsWith("/")) {
      candidates.push(path.join(target, "index.html"));
    } else {
      candidates.push(target);
      if (!path.extname(target)) {
        candidates.push(target + ".html");
        candidates.push(path.join(target, "index.html"));
      }
    }

    for (const candidate of candidates) {
      try {
        if (fs.statSync(candidate).isFile()) {
          sendFile(req, res, candidate);
          return;
        }
      } catch {
        /* try next candidate */
      }
    }

    sendNotFound(res, resolvedRoot);
  });
}
