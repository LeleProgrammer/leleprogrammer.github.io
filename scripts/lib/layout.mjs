import { ICONS, asset, absoluteUrl, initialOf } from "./html.mjs";
import { escapeHtml } from "./utils.mjs";

const NAV = [
  { key: "home", label: "首页", href: "/" },
  { key: "posts", label: "文章", href: "/posts/" },
  { key: "categories", label: "分类", href: "/categories/" },
  { key: "tags", label: "标签", href: "/tags/" },
  { key: "archive", label: "归档", href: "/archive/" },
  { key: "about", label: "关于", href: "/about/" }
];

function activeKeyFor(urlPath) {
  if (urlPath === "/" || urlPath === "/index.html") return "home";
  if (urlPath.startsWith("/posts")) return "posts";
  if (urlPath.startsWith("/categories")) return "categories";
  if (urlPath.startsWith("/tags")) return "tags";
  if (urlPath.startsWith("/archive")) return "archive";
  if (urlPath.startsWith("/about")) return "about";
  return "";
}

function navLinks(site, activeKey) {
  return NAV.map((item) => {
    const active = item.key === activeKey;
    return `<a class="nav-link${active ? " is-active" : ""}" href="${asset(site, item.href)}"${active ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`;
  }).join("");
}

function socialLinks(site, variant) {
  const links = [];
  links.push(`<a class="social-link" href="${asset(site, "/rss.xml")}" title="RSS 订阅">${ICONS.rss}<span>RSS</span></a>`);
  if (site.github) {
    const href = /^https?:\/\//i.test(site.github) ? site.github : "https://github.com/" + site.github.replace(/^@/, "");
    links.push(`<a class="social-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" title="GitHub">${ICONS.github}<span>GitHub</span></a>`);
  }
  if (site.email) {
    links.push(`<a class="social-link" href="mailto:${escapeHtml(site.email)}" title="邮件">${ICONS.mail}<span>Email</span></a>`);
  }
  return `<div class="social-links social-links--${variant}">${links.join("")}</div>`;
}

function footerYear(site) {
  const now = new Date().getFullYear();
  return site.startYear && site.startYear < now ? site.startYear + "–" + now : String(now);
}

export function layout(site, options = {}) {
  const {
    title = "",
    description = "",
    urlPath = "/",
    content = "",
    bodyClass = "",
    ogType = "website",
    ogImage = "",
    article = null,
    jsonLd = null,
    noindex = false
  } = options;

  const activeKey = activeKeyFor(urlPath);
  const fullTitle = title ? title + " · " + site.siteName : site.siteName;
  const metaDescription = description || site.siteDescription || site.siteName + " 的个人博客";
  const canonical = absoluteUrl(site, urlPath);
  const theme = site.defaultTheme === "light" ? "light" : "dark";
  const brand = escapeHtml(site.siteName);
  const homeHref = asset(site, "/");
  const descriptionHtml = site.siteDescription
    ? `<p class="footer-desc">${escapeHtml(site.siteDescription)}</p>`
    : "";
  const footerNoteHtml = site.footerNote
    ? `<p class="footer-note">${escapeHtml(site.footerNote)}</p>`
    : "";
  const icpHtml = site.icp
    ? `<a class="icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">${escapeHtml(site.icp)}</a>`
    : "";
  const imageMeta = ogImage
    ? `<meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">`
    : `<meta name="twitter:card" content="summary">`;
  const articleMeta = article
    ? `<meta property="article:published_time" content="${escapeHtml(article.published)}">
  <meta property="article:modified_time" content="${escapeHtml(article.modified)}">
  ${article.tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join("\n  ")}`
    : "";
  const robots = noindex
    ? `<meta name="robots" content="noindex">`
    : `<meta name="robots" content="index, follow">`;
  const jsonLdHtml = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll("<", "\\u003c")}</script>`
    : "";
  const backgroundUrl = site.backgroundImage
    ? /^https?:\/\//i.test(site.backgroundImage)
      ? site.backgroundImage
      : asset(site, site.backgroundImage)
    : "";
  const backgroundStyle = backgroundUrl
    ? `<style>:root{--bg-image:url("${backgroundUrl.replace(/["'\\\\<>]/g, "")}");--bg-overlay:${(1 - site.backgroundBrightness).toFixed(2)}}</style>`
    : "";
  const bodyClasses = [bodyClass, backgroundUrl ? "has-site-bg" : ""].filter(Boolean).join(" ");
  const devScript = site.dev
    ? `<script>
    (function () {
      var current = null;
      var endpoint = "${asset(site, "/__dev-version")}";
      function check() {
        fetch(endpoint, { cache: "no-store" })
          .then(function (response) { return response.json(); })
          .then(function (data) {
            if (current === null) current = data.id;
            else if (data.id !== current) location.reload();
          })
          .catch(function () {});
      }
      check();
      setInterval(check, 1500);
    })();
  </script>`
    : "";

  return `<!doctype html>
<html lang="${escapeHtml(site.language)}" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="author" content="${escapeHtml(site.authorName)}">
  ${robots}
  <link rel="canonical" href="${escapeHtml(canonical)}">

  <meta property="og:site_name" content="${escapeHtml(site.siteName)}">
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:title" content="${escapeHtml(title || site.siteName)}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  ${imageMeta}
  ${articleMeta}

  <meta name="theme-color" content="#0a0b10">
  <link rel="icon" href="${asset(site, "/assets/favicon.svg")}" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${brand}" href="${asset(site, "/rss.xml")}">
  <link rel="stylesheet" href="${asset(site, "/assets/katex/katex.min.css")}">
  <link rel="stylesheet" href="${asset(site, "/assets/css/style.css")}">
  <script>
    (function () {
      try {
        var stored = localStorage.getItem("leleblog-theme");
        document.documentElement.dataset.theme =
          stored === "light" || stored === "dark" ? stored : "${theme}";
      } catch (error) {
        document.documentElement.dataset.theme = "${theme}";
      }
    })();
  </script>
  ${jsonLdHtml}
  ${backgroundStyle}
</head>
<body class="${escapeHtml(bodyClasses)}" data-search-index="${asset(site, "/search-index.json")}">
  <a class="skip-link" href="#main">跳到正文</a>

  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${homeHref}" aria-label="${brand} 首页">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-text">${brand}</span>
      </a>

      <nav class="site-nav" id="site-nav" aria-label="主导航">
        ${navLinks(site, activeKey)}
      </nav>

      <div class="header-tools">
        <button type="button" class="search-trigger" data-open-search aria-label="搜索文章">
          ${ICONS.search}
          <span class="search-trigger-text">搜索</span>
          <kbd class="search-kbd">Ctrl K</kbd>
        </button>
        <button type="button" class="icon-button theme-toggle" data-theme-toggle aria-label="切换深色与浅色主题">
          <span class="icon-sun">${ICONS.sun}</span>
          <span class="icon-moon">${ICONS.moon}</span>
        </button>
        <button type="button" class="icon-button nav-toggle" data-nav-toggle aria-label="打开导航菜单" aria-expanded="false" aria-controls="site-nav">
          ${ICONS.menu}
        </button>
      </div>
    </div>
  </header>

  <main id="main" class="site-main">
    ${content}
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-about">
        <a class="brand brand--footer" href="${homeHref}">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-text">${brand}</span>
        </a>
        ${descriptionHtml}
        ${footerNoteHtml}
        ${socialLinks(site, "footer")}
      </div>

      <div class="footer-col">
        <h2 class="footer-title">浏览</h2>
        <ul class="footer-list">
          <li><a href="${asset(site, "/")}">首页</a></li>
          <li><a href="${asset(site, "/posts/")}">全部文章</a></li>
          <li><a href="${asset(site, "/categories/")}">分类</a></li>
          <li><a href="${asset(site, "/tags/")}">标签</a></li>
          <li><a href="${asset(site, "/archive/")}">归档</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-title">订阅与联系</h2>
        <ul class="footer-list">
          <li><a href="${asset(site, "/rss.xml")}">RSS 订阅</a></li>
          <li><a href="${asset(site, "/about/")}">关于本站</a></li>
          ${site.github ? `<li><a href="${/^https?:\/\//i.test(site.github) ? site.github : "https://github.com/" + site.github.replace(/^@/, "")}" target="_blank" rel="noopener noreferrer">GitHub</a></li>` : ""}
          ${site.email ? `<li><a href="mailto:${escapeHtml(site.email)}">写封邮件</a></li>` : ""}
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>© ${footerYear(site)} ${brand}</p>
      ${site.icp ? `<div class="footer-bottom-meta">${icpHtml}</div>` : ""}
    </div>
  </footer>

  <div class="search-layer" id="search-layer" hidden>
    <div class="search-backdrop" data-close-search></div>
    <div class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <h2 class="sr-only" id="search-title">站内搜索</h2>
      <div class="search-field">
        ${ICONS.search}
        <input id="search-input" type="search" placeholder="搜索文章、标签、关键词…" autocomplete="off" spellcheck="false" aria-controls="search-results">
        <button type="button" class="search-close" data-close-search aria-label="关闭搜索">${ICONS.close}</button>
      </div>
      <div class="search-results" id="search-results" aria-live="polite">
        <p class="search-empty">输入关键词开始搜索，支持标题、标签与正文内容。</p>
      </div>
      <div class="search-footer">
        <span>↑ ↓ 选择 · Enter 打开 · Esc 关闭</span>
        <span class="search-count"><b id="search-count">0</b> 条结果</span>
      </div>
    </div>
  </div>

  <script src="${asset(site, "/assets/js/main.js")}" defer></script>
  ${devScript}
</body>
</html>`;
}
