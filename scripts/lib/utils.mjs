import path from "node:path";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function escapeXml(value = "") {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

export function slugify(input, fallback = "section") {
  const slug = String(input)
    .trim()
    .toLowerCase()
    .replace(/['"“”‘’]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds()
    ));
  }
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    return new Date(Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0)
    ));
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC"
});

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function formatDate(date) {
  return dateFormatter.format(date);
}

export function formatCardDate(date) {
  return [
    date.getUTCFullYear() + "." + pad2(date.getUTCMonth() + 1) + "." + pad2(date.getUTCDate()),
    pad2(date.getUTCHours()) + ":" + pad2(date.getUTCMinutes())
  ].join(" ");
}

export function formatArchiveDate(date) {
  return pad2(date.getUTCMonth() + 1) + "." + pad2(date.getUTCDate()) + " " +
    pad2(date.getUTCHours()) + ":" + pad2(date.getUTCMinutes());
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function isoDateTime(date) {
  return date.toISOString();
}

export function readingTime(text = "") {
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
  const words = (text.match(/[A-Za-z0-9_]+/g) || []).length;
  const minutes = Math.max(1, Math.round(cjk / 350 + words / 200));
  return minutes;
}

export function truncate(text = "", max = 160) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

export function normalizeTags(tags) {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : String(tags).split(/[,，]/);
  return [...new Set(list.map((tag) => String(tag).trim()).filter(Boolean))];
}

export function normalizeBasePath(value) {
  let base = String(value || "").trim();
  if (!base || base === "/") return "";
  if (!base.startsWith("/")) base = "/" + base;
  return base.replace(/\/+$/, "");
}

export function withBase(base, pathname) {
  const clean = pathname.startsWith("/") ? pathname : "/" + pathname;
  if (!base) return clean;
  return clean === "/" ? base + "/" : base + clean;
}

export function fileExists(fs, filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

export function relativeUrl(fromDir, target) {
  return path.posix.relative(fromDir, target);
}

export function splitHash(href = "") {
  const index = href.indexOf("#");
  if (index === -1) return { path: href, hash: "" };
  return { path: href.slice(0, index), hash: href.slice(index) };
}
