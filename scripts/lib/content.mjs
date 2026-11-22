import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  normalizeBasePath,
  normalizeTags,
  parseDate,
  readingTime,
  slugify,
  truncate
} from "./utils.mjs";

export function loadConfig(root) {
  const file = path.join(root, "site.config.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const config = {
    siteName: "LeleBlog",
    siteDescription: "",
    author: "",
    email: "",
    github: "",
    avatar: "",
    siteUrl: "",
    basePath: "",
    language: "zh-CN",
    defaultTheme: "dark",
    startYear: new Date().getFullYear(),
    postsPerPage: 8,
    footerNote: "",
    icp: "",
    backgroundImage: "",
    backgroundBrightness: 0.45,
    profileButtons: [
      { type: "github", label: "GitHub", url: "", visible: true },
      { type: "gamepad", label: "游戏站", url: "", visible: true },
      { type: "luogu", label: "洛谷", url: "", visible: true },
      { type: "rss", label: "RSS", url: "/rss.xml", visible: true }
    ],
    ...raw
  };

  config.siteName = String(config.siteName || "LeleBlog").trim() || "LeleBlog";
  config.siteDescription = String(config.siteDescription || "").trim();
  config.author = String(config.author || "").trim();
  config.email = String(config.email || "").trim();
  config.github = String(config.github || "").trim();
  config.avatar = String(config.avatar || "").trim();
  config.siteUrl = String(config.siteUrl || "").trim().replace(/\/+$/, "");
  config.language = String(config.language || "zh-CN");

  let basePath = normalizeBasePath(config.basePath);
  if (!basePath && config.siteUrl) {
    try {
      basePath = normalizeBasePath(new URL(config.siteUrl).pathname);
    } catch {
      basePath = "";
    }
  }
  config.basePath = basePath;

  config.defaultTheme = config.defaultTheme === "light" ? "light" : "dark";
  config.postsPerPage = Math.max(1, Number(config.postsPerPage) || 8);
  config.startYear = Number(config.startYear) || new Date().getFullYear();
  config.authorName = config.author || config.siteName;
  config.footerNote = String(config.footerNote || "").trim();
  config.icp = String(config.icp || "").trim();
  config.backgroundImage = String(config.backgroundImage || "").trim();

  const brightnessValue =
    config.backgroundBrightness !== undefined
      ? Number(config.backgroundBrightness)
      : 1 - Number(config.backgroundDim);
  config.backgroundBrightness = Number.isFinite(brightnessValue)
    ? Math.min(1, Math.max(0, brightnessValue))
    : 0.45;

  const fallbackButtons = [
    { type: "github", label: "GitHub", url: "", visible: true },
    { type: "gamepad", label: "游戏站", url: "", visible: true },
    { type: "luogu", label: "洛谷", url: "", visible: true },
    { type: "rss", label: "RSS", url: "/rss.xml", visible: true }
  ];
  const rawButtons = Array.isArray(config.profileButtons) ? config.profileButtons : fallbackButtons;
  config.profileButtons = rawButtons
    .filter((button) => button && typeof button === "object")
    .map((button) => ({
      type: String(button.type || "link").trim().toLowerCase() || "link",
      label: String(button.label || button.type || "链接").trim(),
      url: String(button.url || "").trim(),
      visible: button.visible !== false
    }));

  return config;
}

export function loadPosts({ root, md, includeDrafts = false }) {
  const postsRoot = path.join(root, "content", "posts");
  if (!fs.existsSync(postsRoot)) return [];

  const posts = [];
  const entries = fs.readdirSync(postsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  for (const entry of entries) {
    const slug = entry.name;
    const dir = path.join(postsRoot, slug);
    const file = path.join(dir, "index.md");
    if (!fs.existsSync(file)) continue;

    const parsed = matter(fs.readFileSync(file, "utf8"));
    const data = parsed.data || {};
    if (data.draft === true && !includeDrafts) continue;

    const rendered = md.renderWithMeta(parsed.content);
    const tags = normalizeTags(data.tags);
    const categories = normalizeTags(data.categories);
    const date = parseDate(data.date || fs.statSync(file).mtime);
    const summary = String(data.summary || "").trim() || truncate(rendered.plain, 140);

    posts.push({
      slug,
      title: String(data.title || slug).trim(),
      date,
      updated: data.updated ? parseDate(data.updated) : null,
      tags,
      categories,
      summary,
      cover: data.cover ? String(data.cover).trim() : "",
      coverAlt: String(data.coverAlt || data.title || slug).trim(),
      featured: Boolean(data.featured),
      draft: Boolean(data.draft),
      html: rendered.html,
      headings: rendered.headings,
      plain: rendered.plain,
      readingMinutes: readingTime(rendered.plain),
      url: "/posts/" + slug + "/",
      sourceDir: dir,
      sourceFile: file
    });
  }

  posts.sort((a, b) => b.date - a.date || a.title.localeCompare(b.title, "zh-CN"));
  return posts;
}

export function loadPage({ root, md, name }) {
  const file = path.join(root, "content", "pages", name + ".md");
  if (!fs.existsSync(file)) return null;
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const rendered = md.renderWithMeta(parsed.content);
  return {
    title: String(parsed.data.title || name),
    description: String(parsed.data.description || ""),
    html: rendered.html,
    plain: rendered.plain
  };
}

export function collectTags(posts) {
  const map = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = slugify(tag, "tag");
      if (!map.has(slug)) {
        map.set(slug, { name: tag, slug, posts: [] });
      }
      map.get(slug).posts.push(post);
    }
  }
  return [...map.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, "zh-CN")
  );
}

export function collectCategories(posts) {
  const roots = new Map();
  const nodes = new Map();

  for (const post of posts) {
    let parent = null;
    const trail = [];
    for (const name of post.categories) {
      trail.push(name);
      const key = trail.join("/");
      let node = nodes.get(key);
      if (!node) {
        node = {
          name,
          slug: slugify(name, "category"),
          posts: new Set(),
          children: new Map(),
          parent
        };
        nodes.set(key, node);
        if (parent) parent.children.set(key, node);
        else roots.set(key, node);
      }
      node.posts.add(post);
      parent = node;
    }
  }

  const finalize = (node) => ({
    name: node.name,
    slug: node.slug,
    count: node.posts.size,
    posts: [...node.posts].sort((a, b) => b.date - a.date),
    children: [...node.children.values()]
      .map(finalize)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"))
  });

  return [...roots.values()]
    .map(finalize)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function copyPostAssets(post, distRoot) {
  const target = path.join(distRoot, "posts", post.slug);
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(post.sourceDir, target, {
    recursive: true,
    filter: (source) => path.basename(source) !== "index.md"
  });
}

export function findMissingLocalAssets(post) {
  const missing = [];
  const matches = post.html.matchAll(/<img[^>]+src="([^"]+)"/g);
  for (const match of matches) {
    const src = match[1];
    if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("/")) continue;
    const clean = decodeURIComponent(src.split("?")[0].split("#")[0]);
    const target = path.join(post.sourceDir, clean);
    if (!fs.existsSync(target)) missing.push(src);
  }
  if (post.cover && !/^(https?:)?\/\//i.test(post.cover) && !post.cover.startsWith("/")) {
    const target = path.join(post.sourceDir, decodeURIComponent(post.cover.split("?")[0]));
    if (!fs.existsSync(target)) missing.push(post.cover);
  }
  return missing;
}
