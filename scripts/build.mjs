import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadConfig, loadPosts, loadPage, collectCategories, collectTags, copyPostAssets, findMissingLocalAssets } from "./lib/content.mjs";
import { createMarkdown } from "./lib/markdown.mjs";
import {
  renderHome,
  renderPostsIndex,
  renderPost,
  renderCategoriesIndex,
  renderCategoryPage,
  renderTagsIndex,
  renderTagPage,
  renderArchive,
  renderAbout,
  render404
} from "./lib/pages.mjs";
import { absoluteUrl } from "./lib/html.mjs";
import { escapeXml, isoDate, withBase } from "./lib/utils.mjs";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = path.join(projectRoot, "dist");

function writeFile(relativePath, content) {
  const target = path.join(distRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function copyStaticAssets() {
  copyDir(path.join(projectRoot, "assets", "css"), path.join(distRoot, "assets", "css"));
  copyDir(path.join(projectRoot, "assets", "js"), path.join(distRoot, "assets", "js"));
  copyDir(path.join(projectRoot, "assets", "images"), path.join(distRoot, "assets", "images"));
  const favicon = path.join(projectRoot, "assets", "favicon.svg");
  if (fs.existsSync(favicon)) {
    fs.mkdirSync(path.join(distRoot, "assets"), { recursive: true });
    fs.copyFileSync(favicon, path.join(distRoot, "assets", "favicon.svg"));
  }

  const katexDist = path.join(projectRoot, "node_modules", "katex", "dist");
  const katexTarget = path.join(distRoot, "assets", "katex");
  if (fs.existsSync(katexDist)) {
    fs.mkdirSync(katexTarget, { recursive: true });
    fs.copyFileSync(path.join(katexDist, "katex.min.css"), path.join(katexTarget, "katex.min.css"));
    copyDir(path.join(katexDist, "fonts"), path.join(katexTarget, "fonts"));
  } else {
    console.warn("! katex not installed, math styles will be missing. Run npm install first.");
  }
}

function buildSearchIndex(site, posts) {
  const entries = posts.map((post) => ({
    title: post.title,
    url: withBase(site.basePath, post.url),
    date: isoDate(post.date),
    tags: post.tags,
    categories: post.categories,
    summary: post.summary,
    text: post.plain.slice(0, 8000)
  }));
  writeFile("search-index.json", JSON.stringify(entries));
  return entries.length;
}

function buildRss(site, posts) {
  const link = absoluteUrl(site, "/");
  const self = absoluteUrl(site, "/rss.xml");
  const items = posts.slice(0, 20).map((post) => {
    const url = absoluteUrl(site, post.url);
    return [
      "    <item>",
      "      <title>" + escapeXml(post.title) + "</title>",
      "      <link>" + escapeXml(url) + "</link>",
      '      <guid isPermaLink="true">' + escapeXml(url) + "</guid>",
      "      <pubDate>" + post.date.toUTCString() + "</pubDate>",
      "      <description>" + escapeXml(post.summary) + "</description>",
      ...post.categories.map((category) => "      <category>" + escapeXml(category) + "</category>"),
      ...post.tags.map((tag) => "      <category>" + escapeXml(tag) + "</category>"),
      "    </item>"
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>" + escapeXml(site.siteName) + "</title>",
    "    <link>" + escapeXml(link) + "</link>",
    "    <description>" + escapeXml(site.siteDescription || site.siteName) + "</description>",
    "    <language>" + escapeXml(site.language.toLowerCase()) + "</language>",
    '    <atom:link href="' + escapeXml(self) + '" rel="self" type="application/rss+xml"/>',
    "    <lastBuildDate>" + new Date().toUTCString() + "</lastBuildDate>",
    ...items,
    "  </channel>",
    "</rss>",
    ""
  ].join("\n");

  writeFile("rss.xml", xml);
}

function buildSitemap(site, posts, tags, categories) {
  if (!site.siteUrl) {
    console.warn("! sitemap skipped: fill siteUrl in site.config.json to enable it.");
    return false;
  }

  const urls = [
    { url: "/", lastmod: isoDate(new Date()) },
    { url: "/posts/", lastmod: posts[0] ? isoDate(posts[0].updated || posts[0].date) : isoDate(new Date()) },
    { url: "/tags/", lastmod: isoDate(new Date()) },
    { url: "/archive/", lastmod: posts[0] ? isoDate(posts[0].updated || posts[0].date) : isoDate(new Date()) },
    { url: "/about/", lastmod: isoDate(new Date()) },
    ...posts.map((post) => ({ url: post.url, lastmod: isoDate(post.updated || post.date) })),
    ...tags.map((tag) => ({ url: "/tags/" + encodeURIComponent(tag.slug) + "/", lastmod: isoDate(new Date()) })),
    ...flattenCategories(categories).map((category) => ({
      url: "/categories/" + encodeURIComponent(category.slug) + "/",
      lastmod: isoDate(new Date())
    }))
  ];

  const entries = urls.map((entry) => [
    "  <url>",
    "    <loc>" + escapeXml(absoluteUrl(site, entry.url)) + "</loc>",
    "    <lastmod>" + entry.lastmod + "</lastmod>",
    "  </url>"
  ].join("\n"));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    ""
  ].join("\n");

  writeFile("sitemap.xml", xml);
  return true;
}

function flattenCategories(categories) {
  const list = [];
  const walk = (nodes) => {
    for (const node of nodes) {
      list.push(node);
      walk(node.children);
    }
  };
  walk(categories);
  return list;
}

function buildRobots(site) {
  const lines = ["User-agent: *", "Allow: /"];
  if (site.siteUrl) {
    lines.push("", "Sitemap: " + absoluteUrl(site, "/sitemap.xml"));
  }
  writeFile("robots.txt", lines.join("\n") + "\n");
}

function reportMissingAssets(posts) {
  let warnings = 0;
  for (const post of posts) {
    const missing = findMissingLocalAssets(post);
    for (const assetPath of missing) {
      warnings += 1;
      console.warn("! missing image in " + post.slug + ": " + assetPath);
    }
  }
  return warnings;
}

export async function build(options = {}) {
  const dev = Boolean(options.dev);
  const startedAt = Date.now();

  fs.rmSync(distRoot, { recursive: true, force: true });
  fs.mkdirSync(distRoot, { recursive: true });

  const site = loadConfig(projectRoot);
  site.dev = dev;
  if (!site.siteUrl) {
    console.warn("! siteUrl is empty in site.config.json: RSS, sitemap and canonical URLs will be relative.");
  }

  const md = createMarkdown();
  const posts = loadPosts({ root: projectRoot, md, includeDrafts: dev });
  const tags = collectTags(posts).map((tag) => ({ ...tag, count: tag.posts.length }));
  const categories = collectCategories(posts);

  copyStaticAssets();
  reportMissingAssets(posts);

  writeFile("index.html", renderHome(site, posts, tags, categories));

  const pageSize = site.postsPerPage;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  for (let page = 1; page <= totalPages; page += 1) {
    const slice = posts.slice((page - 1) * pageSize, page * pageSize);
    const html = renderPostsIndex(site, slice, page, totalPages);
    writeFile(page === 1 ? path.join("posts", "index.html") : path.join("posts", "page", String(page), "index.html"), html);
  }

  posts.forEach((post, index) => {
    const previous = posts[index + 1] || null;
    const next = posts[index - 1] || null;
    writeFile(path.join("posts", post.slug, "index.html"), renderPost(site, post, previous, next));
    copyPostAssets(post, distRoot);
  });

  writeFile(path.join("categories", "index.html"), renderCategoriesIndex(site, categories));
  for (const category of flattenCategories(categories)) {
    writeFile(path.join("categories", category.slug, "index.html"), renderCategoryPage(site, category));
  }

  writeFile(path.join("tags", "index.html"), renderTagsIndex(site, tags));
  for (const tag of tags) {
    writeFile(path.join("tags", tag.slug, "index.html"), renderTagPage(site, tag));
  }

  writeFile(path.join("archive", "index.html"), renderArchive(site, posts));
  writeFile(path.join("about", "index.html"), renderAbout(site, loadPage({ root: projectRoot, md, name: "about" })));
  writeFile("404.html", render404(site));

  buildSearchIndex(site, posts);
  buildRss(site, posts);
  buildSitemap(site, posts, tags, categories);
  buildRobots(site);

  const duration = ((Date.now() - startedAt) / 1000).toFixed(2);
  console.log(
    "✓ built " + posts.length + " posts, " + categories.length + " categories, " + tags.length + " tags, " + totalPages + " page(s) in " + duration + "s → dist/"
  );
  if (dev) console.log("  dev mode: draft posts included, live reload enabled");

  return { posts, tags, totalPages };
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  build({ dev: process.argv.includes("--dev") }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
