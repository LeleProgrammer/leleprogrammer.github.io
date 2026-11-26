import { ICONS, asset, categoryHref, coverUrl, pageHref, postHref, tagHref } from "./html.mjs";
import { escapeHtml, formatCardDate, isoDateTime, slugify } from "./utils.mjs";

export function tagChip(site, name, count = null, className = "") {
  const slug = slugify(name, "tag");
  const countHtml = count === null ? "" : `<span class="tag-chip-count">${count}</span>`;
  return `<a class="tag-chip${className ? " " + className : ""}" href="${tagHref(site, { slug })}">#${escapeHtml(name)}${countHtml}</a>`;
}

export function tagCloud(site, tags, options = {}) {
  const { withCount = true, className = "" } = options;
  if (!tags.length) return "";
  return `<div class="tag-cloud${className ? " " + className : ""}">${tags.map((tag) => tagChip(site, tag.name, withCount ? tag.count : null)).join("")}</div>`;
}

function cardMeta(site, post) {
  const lastCategory = post.categories.length ? post.categories[post.categories.length - 1] : "";
  const firstTag = post.tags.length ? post.tags[0] : "";
  let category;
  if (lastCategory) {
    category = `<a class="post-card-cat" href="${categoryHref(site, lastCategory)}">${escapeHtml(lastCategory)}</a>`;
  } else if (firstTag) {
    category = `<a class="post-card-cat" href="${tagHref(site, { slug: slugify(firstTag, "tag") })}">${escapeHtml(firstTag)}</a>`;
  } else {
    category = `<span class="post-card-cat">文章</span>`;
  }
  return `<div class="post-card-meta">${category}<time datetime="${isoDateTime(post.date)}">${formatCardDate(post.date)}</time></div>`;
}

export function postCard(site, post, variant = "default") {
  const href = postHref(site, post);
  const cover = coverUrl(site, post);
  const classes = ["post-card"];
  if (variant === "solo") classes.push("post-card--solo");
  if (!cover) classes.push("post-card--textonly");

  const media = cover
    ? `<a class="post-card-media" href="${href}" aria-hidden="true" tabindex="-1">
        <img src="${cover}" alt="${escapeHtml(post.coverAlt)}" loading="lazy" decoding="async">
      </a>`
    : "";

  const tags = post.tags.slice(0, 3).map((tag) => tagChip(site, tag, null, "tag-chip--small")).join("");
  const body = `<div class="post-card-body">
    ${cardMeta(site, post)}
    <h3 class="post-card-title"><a href="${href}">${escapeHtml(post.title)}</a></h3>
    <p class="post-card-summary">${escapeHtml(post.summary)}</p>
    <div class="post-card-foot">
      <div class="post-card-tags">${tags}</div>
      <span class="post-card-time">${post.readingMinutes} 分钟</span>
    </div>
  </div>`;

  return `<article class="${classes.join(" ")}">${variant === "solo" ? body + media : media + body}</article>`;
}

export function pageHead(options = {}) {
  const { eyebrow = "", title = "", description = "", extra = "" } = options;
  return `<header class="page-head">
    ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
    <h1 class="page-title">${escapeHtml(title)}</h1>
    ${description ? `<p class="page-desc">${escapeHtml(description)}</p>` : ""}
    ${extra}
  </header>`;
}

export function sectionHead(options = {}) {
  const { title, description = "", href = "", linkLabel = "查看全部" } = options;
  return `<div class="section-head">
    <div>
      <h2 class="section-title">${escapeHtml(title)}</h2>
      ${description ? `<p class="section-desc">${escapeHtml(description)}</p>` : ""}
    </div>
    ${href ? `<a class="section-link" href="${href}">${escapeHtml(linkLabel)} ${ICONS.arrow}</a>` : ""}
  </div>`;
}

export function emptyState(options = {}) {
  const { title = "暂时还没有内容", description = "", href = "", linkLabel = "" } = options;
  return `<div class="empty-state">
    <p class="empty-title">${escapeHtml(title)}</p>
    ${description ? `<p class="empty-desc">${escapeHtml(description)}</p>` : ""}
    ${href ? `<a class="btn btn-primary" href="${href}">${escapeHtml(linkLabel)}</a>` : ""}
  </div>`;
}

export function pagination(site, currentPage, totalPages) {
  if (totalPages <= 1) return "";
  const items = [];
  for (let i = 1; i <= totalPages; i += 1) {
    const gap = i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 1;
    if (gap) {
      if (items[items.length - 1] !== "gap") items.push("gap");
      continue;
    }
    items.push(i);
  }
  const links = items.map((item) => {
    if (item === "gap") return `<span class="pagination-gap">…</span>`;
    const active = item === currentPage;
    return `<a class="pagination-link${active ? " is-current" : ""}" href="${pageHref(site, item)}"${active ? ' aria-current="page"' : ""}>${item}</a>`;
  }).join("");

  return `<nav class="pagination" aria-label="分页">
    ${currentPage > 1 ? `<a class="pagination-arrow" href="${pageHref(site, currentPage - 1)}" rel="prev">← 上一页</a>` : `<span class="pagination-arrow is-disabled">← 上一页</span>`}
    <div class="pagination-pages">${links}</div>
    ${currentPage < totalPages ? `<a class="pagination-arrow" href="${pageHref(site, currentPage + 1)}" rel="next">下一页 →</a>` : `<span class="pagination-arrow is-disabled">下一页 →</span>`}
  </nav>`;
}

export function toc(headings) {
  if (!headings.length) return "";

  const roots = [];
  let currentParent = null;
  for (const heading of headings) {
    const node = { level: heading.level, id: heading.id, text: heading.text, children: [] };
    if (heading.level === 2 || !currentParent) {
      roots.push(node);
      currentParent = node;
    } else {
      currentParent.children.push(node);
    }
  }

  const renderItem = (node) => {
    const children = node.children.length
      ? `<ul class="toc-sublist">${node.children.map(renderItem).join("")}</ul>`
      : "";
    return `<li class="toc-item toc-item--h${node.level}">
      <a class="toc-link" href="#${node.id}" data-toc-link><span class="toc-dot" aria-hidden="true"></span><span class="toc-text">${escapeHtml(node.text)}</span></a>
      ${children}
    </li>`;
  };

  return `<aside class="article-toc" aria-label="本文目录">
    <p class="toc-title">本文目录</p>
    <ul class="toc-list">${roots.map(renderItem).join("")}</ul>
  </aside>`;
}

export function postNav(site, previous, next) {
  if (!previous && !next) return "";
  const previousHtml = previous
    ? `<a class="post-nav-link" href="${postHref(site, previous)}"><span class="post-nav-label">← 上一篇</span><strong>${escapeHtml(previous.title)}</strong></a>`
    : `<span class="post-nav-empty"></span>`;
  const nextHtml = next
    ? `<a class="post-nav-link post-nav-link--next" href="${postHref(site, next)}"><span class="post-nav-label">下一篇 →</span><strong>${escapeHtml(next.title)}</strong></a>`
    : `<span class="post-nav-empty"></span>`;
  return `<nav class="post-nav" aria-label="相邻文章">${previousHtml}${nextHtml}</nav>`;
}

export function categoryTree(site, nodes) {
  if (!nodes.length) return "";
  return `<ul class="category-tree">${nodes.map((node) => `
    <li class="category-node">
      <a class="category-link" href="${categoryHref(site, node.name)}">
        <span class="category-name">${escapeHtml(node.name)}</span>
        <span class="category-count">${node.count}</span>
      </a>
      ${categoryTree(site, node.children)}
    </li>`).join("")}</ul>`;
}

export function tagPageList(site, tags) {
  if (!tags.length) return "";
  return `<div class="tag-index-grid">
    ${tags.map((tag) => `<a class="tag-index-card" href="${tagHref(site, tag)}">
      <span class="tag-index-name">#${escapeHtml(tag.name)}</span>
      <span class="tag-index-count">${tag.posts.length} 篇文章</span>
    </a>`).join("")}
  </div>`;
}
