import { layout } from "./layout.mjs";
import {
  categoryTree,
  emptyState,
  pageHead,
  pagination,
  postCard,
  postNav,
  sectionHead,
  tagCloud,
  tagChip,
  tagPageList,
  toc
} from "./components.mjs";
import { ICONS, absoluteUrl, asset, avatarUrl, categoryHref, coverUrl, initialOf, postHref, tagHref } from "./html.mjs";
import { escapeHtml, formatDate, isoDate, slugify } from "./utils.mjs";

function countCategoryNodes(nodes) {
  return nodes.reduce((sum, node) => sum + 1 + countCategoryNodes(node.children), 0);
}

function siteYears(site, posts) {
  const now = new Date().getFullYear();
  if (!posts.length) return 1;
  const first = Math.min(...posts.map((post) => post.date.getUTCFullYear()));
  return Math.max(1, now - first + 1);
}

function profileButtonUrl(site, button) {
  let url = button.url;
  if (!url && button.type === "github" && site.github) {
    url = /^https?:\/\//i.test(site.github)
      ? site.github
      : "https://github.com/" + site.github.replace(/^@/, "");
  }
  if (!url) return "";
  if (/^(https?:|mailto:)/i.test(url)) return url;
  return asset(site, url.startsWith("/") ? url : "/" + url);
}

function profileActions(site) {
  const buttons = site.profileButtons.filter((button) => button.visible);
  if (!buttons.length) return "";
  const items = buttons.map((button) => {
    const url = profileButtonUrl(site, button);
    const icon = ICONS[button.type] || ICONS.link;
    const label = escapeHtml(button.label);
    const iconHtml = `<span class="profile-action-icon" aria-hidden="true">${icon}</span>`;
    if (!url) {
      return `<span class="profile-action is-disabled" title="请在 site.config.json 的 profileButtons 中填写链接">${iconHtml}<span>${label}</span></span>`;
    }
    const external = /^https?:\/\//i.test(url);
    return `<a class="profile-action" href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${iconHtml}<span>${label}</span></a>`;
  }).join("");
  return `<div class="profile-actions">${items}</div>`;
}

function hero(site, posts, tags, categories) {
  const avatar = avatarUrl(site);
  const avatarHtml = avatar
    ? `<img src="${avatar}" alt="${escapeHtml(site.authorName)}" loading="eager">`
    : initialOf(site.authorName);
  const description = site.siteDescription
    ? `<p class="hero-lede">${escapeHtml(site.siteDescription)}</p>`
    : "";
  const actions = `<div class="hero-actions">
    ${posts.length ? `<a class="btn btn-primary" href="${asset(site, "/posts/")}">浏览文章 ${ICONS.arrow}</a>` : ""}
    <a class="btn btn-ghost" href="${asset(site, "/rss.xml")}">${ICONS.rss} RSS 订阅</a>
  </div>`;

  return `<section class="hero">
    <div class="hero-copy">
      <p class="kicker"><span class="kicker-dot" aria-hidden="true"></span>PERSONAL BLOG<span class="kicker-divider">/</span>SINCE ${site.startYear}</p>
      <h1 class="hero-title">${escapeHtml(site.siteName)}</h1>
      ${description}
      ${actions}
    </div>

    <aside class="profile-card" aria-label="站点概览">
      <div class="profile-head">
        <span class="avatar">${avatarHtml}</span>
        <div class="profile-id">
          <h2 class="profile-name">${escapeHtml(site.authorName)}</h2>
          ${site.author ? `<p class="profile-role">作者</p>` : ""}
        </div>
      </div>
      <dl class="profile-stats">
        <div class="profile-stat"><dt>文章</dt><dd>${posts.length}</dd></div>
        <div class="profile-stat"><dt>分类</dt><dd>${countCategoryNodes(categories)}</dd></div>
        <div class="profile-stat"><dt>标签</dt><dd>${tags.length}</dd></div>
        <div class="profile-stat"><dt>写作</dt><dd>${siteYears(site, posts)}<span>年</span></dd></div>
      </dl>
      ${profileActions(site)}
    </aside>
  </section>`;
}

export function renderHome(site, posts, tags, categories) {
  const latest = posts.slice(0, 6);
  const solo = posts.length === 1;
  const grid = posts.length
    ? `<div class="post-grid${solo ? " post-grid--solo" : ""}">${latest.map((post) => postCard(site, post, solo ? "solo" : "default")).join("")}</div>`
    : emptyState({
        title: "还没有文章",
        description: "在 content/posts 下新建一个文件夹，放入 index.md 就可以开始写作。",
        href: asset(site, "/about/"),
        linkLabel: "先看看关于页"
      });

  const tagsSection = tags.length
    ? `<section class="section">
        ${sectionHead({ title: "标签", description: "按主题浏览全部文章", href: asset(site, "/tags/"), linkLabel: "全部标签" })}
        ${tagCloud(site, tags, { withCount: true })}
      </section>`
    : "";

  const body = `<div class="container">
  ${hero(site, posts, tags, categories)}
  <section class="section">
    ${sectionHead({ title: "最新文章", description: posts.length ? "共 " + posts.length + " 篇" : "", href: posts.length > 6 ? asset(site, "/posts/") : "", linkLabel: "查看全部" })}
    ${grid}
  </section>
  ${tagsSection}
  </div>`;

  return layout(site, {
    title: "",
    description: site.siteDescription,
    urlPath: "/",
    content: body,
    bodyClass: "page-home",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.siteName,
      url: absoluteUrl(site, "/"),
      description: site.siteDescription || undefined,
      inLanguage: site.language
    }
  });
}

export function renderPostsIndex(site, posts, page, totalPages) {
  const body = `<div class="container">
    ${pageHead({
      eyebrow: "ARCHIVE OF WRITING",
      title: page > 1 ? "全部文章 · 第 " + page + " 页" : "全部文章",
      description: "共 " + posts.length + " 篇文章，按发布时间从新到旧排列。"
    })}
    <div class="post-grid">
      ${posts.map((post) => postCard(site, post)).join("")}
    </div>
    ${pagination(site, page, totalPages)}
  </div>`;

  return layout(site, {
    title: page > 1 ? "全部文章 · 第 " + page + " 页" : "全部文章",
    description: site.siteName + " 的全部文章。",
    urlPath: page > 1 ? "/posts/page/" + page + "/" : "/posts/",
    content: body,
    bodyClass: "page-posts",
    noindex: page > 1
  });
}

export function renderPost(site, post, previous, next) {
  const cover = coverUrl(site, post);
  const coverAbsolute = cover
    ? /^https?:\/\//i.test(post.cover)
      ? post.cover
      : absoluteUrl(site, post.url + post.cover)
    : "";
  const tags = post.tags.map((tag) => tagChip(site, tag, null, "tag-chip--small")).join("");
  const categories = post.categories.length
    ? `<nav class="article-categories" aria-label="文章分类">${post.categories
        .map((name) => `<a href="${categoryHref(site, name)}">${escapeHtml(name)}</a>`)
        .join('<span class="category-separator" aria-hidden="true">/</span>')}</nav>`
    : "";
  const avatar = avatarUrl(site);
  const avatarHtml = avatar
    ? `<img src="${avatar}" alt="">`
    : initialOf(site.authorName);
  const updated = post.updated && post.updated.getTime() !== post.date.getTime()
    ? `<span class="article-meta-item">更新于 ${formatDate(post.updated)}</span>`
    : "";
  const coverFigure = cover
    ? `<figure class="article-cover">
        <img src="${cover}" alt="${escapeHtml(post.coverAlt)}" loading="eager" decoding="async">
      </figure>`
    : "";

  const body = `<article class="article">
    <div class="container">
      <header class="article-head">
        <a class="back-link" href="${asset(site, "/posts/")}">← 全部文章</a>
        ${categories}
        ${tags ? `<div class="article-tags">${tags}</div>` : ""}
        <h1 class="article-title">${escapeHtml(post.title)}</h1>
        <div class="article-meta">
          <span class="article-meta-item article-author"><span class="avatar avatar--tiny" aria-hidden="true">${avatarHtml}</span>${escapeHtml(site.authorName)}</span>
          <time class="article-meta-item" datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
          <span class="article-meta-item">${post.readingMinutes} 分钟阅读</span>
          ${updated}
        </div>
      </header>

      ${coverFigure}

      <div class="article-layout${post.headings.length ? "" : " article-layout--single"}">
        <div class="prose">
          ${post.html}
        </div>
        ${toc(post.headings)}
      </div>

      ${postNav(site, previous, next)}
    </div>
  </article>`;

  return layout(site, {
    title: post.title,
    description: post.summary,
    urlPath: post.url,
    content: body,
    bodyClass: "page-article",
    ogType: "article",
    ogImage: coverAbsolute,
    article: {
      published: post.date.toISOString(),
      modified: (post.updated || post.date).toISOString(),
      tags: post.tags
    },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      datePublished: post.date.toISOString(),
      dateModified: (post.updated || post.date).toISOString(),
      author: { "@type": "Person", name: site.authorName },
      articleSection: post.categories.length ? post.categories : undefined,
      image: coverAbsolute || undefined,
      mainEntityOfPage: absoluteUrl(site, post.url),
      inLanguage: site.language
    }
  });
}

export function renderTagsIndex(site, tags) {
  const description = tags.length ? "共 " + tags.length + " 个标签。" : "还没有标签。";
  const body = `<div class="container">
    ${pageHead({ eyebrow: "TOPICS", title: "标签", description })}
    ${tags.length ? tagPageList(site, tags) : emptyState({ title: "还没有标签", description: "在文章 frontmatter 的 tags 中加入标签即可。" })}
  </div>`;

  return layout(site, {
    title: "标签",
    description: site.siteName + " 的全部标签。",
    urlPath: "/tags/",
    content: body,
    bodyClass: "page-tags"
  });
}

export function renderTagPage(site, tag) {
  const body = `<div class="container">
    <a class="back-link" href="${asset(site, "/tags/")}">← 全部标签</a>
    ${pageHead({ eyebrow: "TAG", title: "#" + tag.name, description: tag.posts.length + " 篇相关文章" })}
    <div class="post-grid">${tag.posts.map((post) => postCard(site, post)).join("")}</div>
  </div>`;

  return layout(site, {
    title: "标签 · " + tag.name,
    description: "标签 " + tag.name + " 下的文章。",
    urlPath: "/tags/" + encodeURIComponent(tag.slug) + "/",
    content: body,
    bodyClass: "page-tag"
  });
}

export function renderCategoriesIndex(site, categories) {
  const total = countCategoryNodes(categories);
  const body = `<div class="container">
    ${pageHead({
      eyebrow: "CATEGORIES",
      title: "分类",
      description: categories.length ? "共 " + total + " 个分类，按层级整理。" : "还没有分类。"
    })}
    ${categories.length
      ? `<div class="category-index">${categoryTree(site, categories)}</div>`
      : emptyState({ title: "还没有分类", description: "在文章 frontmatter 的 categories 中加入分类即可。" })}
  </div>`;

  return layout(site, {
    title: "分类",
    description: site.siteName + " 的全部分类。",
    urlPath: "/categories/",
    content: body,
    bodyClass: "page-categories"
  });
}

export function renderCategoryPage(site, category) {
  const children = category.children.length
    ? `<div class="category-children">${category.children
        .map((child) => `<a class="tag-chip" href="${categoryHref(site, child.name)}">${escapeHtml(child.name)}<span class="tag-chip-count">${child.count}</span></a>`)
        .join("")}</div>`
    : "";

  const body = `<div class="container">
    <a class="back-link" href="${asset(site, "/categories/")}">← 全部分类</a>
    ${pageHead({ eyebrow: "CATEGORY", title: category.name, description: category.count + " 篇文章" })}
    ${children}
    <div class="post-grid">${category.posts.map((post) => postCard(site, post)).join("")}</div>
  </div>`;

  return layout(site, {
    title: "分类 · " + category.name,
    description: "分类 " + category.name + " 下的文章。",
    urlPath: "/categories/" + encodeURIComponent(category.slug) + "/",
    content: body,
    bodyClass: "page-category"
  });
}

export function renderArchive(site, posts) {
  const groups = new Map();
  for (const post of posts) {
    const year = post.date.getUTCFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(post);
  }
  const years = [...groups.entries()].sort((a, b) => b[0] - a[0]);
  const list = years.map(([year, items]) => `<section class="archive-group">
    <h2 class="archive-year">${year}<span>${items.length} 篇</span></h2>
    <ul class="archive-list">
      ${items.map((post) => `<li class="archive-item">
        <time datetime="${isoDate(post.date)}">${isoDate(post.date).slice(5).replace("-", ".")}</time>
        <a class="archive-link" href="${postHref(site, post)}">${escapeHtml(post.title)}</a>
        <span class="archive-tag">${post.categories.length ? escapeHtml(post.categories[post.categories.length - 1]) : post.tags.length ? "#" + escapeHtml(post.tags[0]) : ""}</span>
      </li>`).join("")}
    </ul>
  </section>`).join("");

  const body = `<div class="container">
    ${pageHead({ eyebrow: "ARCHIVE", title: "归档", description: posts.length ? "共 " + posts.length + " 篇文章，按年份整理。" : "" })}
    ${posts.length ? `<div class="archive">${list}</div>` : emptyState({ title: "还没有文章" })}
  </div>`;

  return layout(site, {
    title: "归档",
    description: site.siteName + " 的文章归档。",
    urlPath: "/archive/",
    content: body,
    bodyClass: "page-archive"
  });
}

export function renderAbout(site, page) {
  const content = page
    ? `<div class="prose about-prose">${page.html}</div>`
    : emptyState({
        title: "关于页还是空的",
        description: "在 content/pages/about.md 中写下关于你的介绍，构建后就会出现在这里。"
      });

  const body = `<div class="container container--narrow">
    ${pageHead({ eyebrow: "ABOUT", title: page ? page.title : "关于", description: page ? page.description : "" })}
    ${content}
    <div class="about-links">
      <a class="btn btn-ghost" href="${asset(site, "/rss.xml")}">${ICONS.rss} RSS 订阅</a>
      ${site.github ? `<a class="btn btn-ghost" href="${/^https?:\/\//i.test(site.github) ? site.github : "https://github.com/" + site.github.replace(/^@/, "")}" target="_blank" rel="noopener noreferrer">${ICONS.github} GitHub</a>` : ""}
      ${site.email ? `<a class="btn btn-ghost" href="mailto:${escapeHtml(site.email)}">${ICONS.mail} 写封邮件</a>` : ""}
    </div>
  </div>`;

  return layout(site, {
    title: "关于",
    description: site.siteDescription || site.siteName + " 的关于页。",
    urlPath: "/about/",
    content: body,
    bodyClass: "page-about"
  });
}

export function render404(site) {
  const body = `<div class="container container--narrow">
    <section class="notfound">
      <p class="notfound-code">404</p>
      <h1 class="notfound-title">这一页不存在</h1>
      <p class="notfound-desc">链接可能已经失效，或者文章被移动到了别处。</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${asset(site, "/")}">回到首页</a>
        <a class="btn btn-ghost" href="${asset(site, "/posts/")}">浏览文章</a>
      </div>
    </section>
  </div>`;

  return layout(site, {
    title: "页面不存在",
    description: "页面不存在。",
    urlPath: "/404.html",
    content: body,
    bodyClass: "page-404",
    noindex: true
  });
}
