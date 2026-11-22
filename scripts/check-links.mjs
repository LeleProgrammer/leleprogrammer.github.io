import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./lib/content.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = path.join(root, "dist");
const site = loadConfig(root);
const base = site.basePath;

if (!fs.existsSync(dist)) {
  console.error("dist/ does not exist. Run npm run build first.");
  process.exit(1);
}

const problems = [];
const externalAssets = new Set();
const externalImages = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) checkFile(full);
  }
}

function checkFile(file) {
  const html = fs.readFileSync(file, "utf8");
  const relativeFile = path.relative(dist, file);

  for (const match of html.matchAll(/<(link|script|img|source)\b[^>]*?\b(?:href|src)="(https?:\/\/[^"]+)"/gi)) {
    const tag = match[1].toLowerCase();
    if (tag === "link" && !/rel="(?:stylesheet|icon|preload|modulepreload)"/i.test(match[0])) continue;
    if (tag === "img" || tag === "source") externalImages.add(match[2]);
    else externalAssets.add(match[2]);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(raw)) continue;

    let clean = decodeURIComponent(raw.split("#")[0].split("?")[0]);
    if (!clean) continue;

    if (base && (clean === base || clean.startsWith(base + "/"))) {
      clean = clean.slice(base.length) || "/";
    }

    const baseDir = clean.startsWith("/") ? dist : path.dirname(file);
    const resolved = path.resolve(baseDir, clean.replace(/^\/+/, ""));
    if (resolved !== dist && !resolved.startsWith(dist + path.sep)) {
      problems.push(relativeFile + " -> " + raw + " (outside dist)");
      continue;
    }

    const candidates = clean.endsWith("/")
      ? [path.join(resolved, "index.html")]
      : [resolved, resolved + ".html", path.join(resolved, "index.html")];

    if (!candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) {
      problems.push(relativeFile + " -> " + raw);
    }
  }
}

walk(dist);

const cssFiles = [];
const collectCss = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectCss(full);
    else if (entry.name.endsWith(".css")) cssFiles.push(full);
  }
};
collectCss(path.join(dist, "assets"));
for (const cssFile of cssFiles) {
  const css = fs.readFileSync(cssFile, "utf8");
  for (const match of css.matchAll(/url\(\s*["']?(https?:\/\/[^"')]+)/gi)) {
    externalAssets.add(match[1]);
  }
}

if (externalAssets.size) {
  console.log("external CDN assets (not bundled): " + externalAssets.size);
  for (const asset of externalAssets) console.log("  " + asset);
} else {
  console.log("✓ no external CDN assets");
}

if (externalImages.size) {
  console.log("external content images: " + externalImages.size);
  for (const image of externalImages) console.log("  " + image);
}

if (problems.length) {
  console.error("Broken internal links: " + problems.length);
  for (const problem of problems.slice(0, 50)) console.error("  " + problem);
  process.exit(1);
}

console.log("✓ all internal links and assets resolve");
