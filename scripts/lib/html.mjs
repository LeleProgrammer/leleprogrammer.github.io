import { slugify, withBase } from "./utils.mjs";

export const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"></circle><path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"></path></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7Z"></path></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
  rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"></path><circle cx="6" cy="18" r="1.4" fill="currentColor" stroke="none"></circle></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5a10.2 10.2 0 0 0 6.8-9.7C22 6.6 17.5 2 12 2Z"></path></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m4 7 8 6 8-6"></path></svg>',
  gamepad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 8h9a4.5 4.5 0 0 1 4.4 5.4l-.7 3.4a2 2 0 0 1-3.4 1l-2.3-2.1h-5l-2.3 2.1a2 2 0 0 1-3.4-1l-.7-3.4A4.5 4.5 0 0 1 7.5 8Z"></path><path d="M8 11v2.5M6.75 12.25h2.5M15.5 11.5h.01M17.5 13.5h.01"></path></svg>',
  luogu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"></rect><path d="M9 7v10h6.5"></path></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"></path></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>'
};

export function asset(site, pathname) {
  return withBase(site.basePath, pathname);
}

export function absoluteUrl(site, pathname) {
  if (!site.siteUrl) return asset(site, pathname);
  try {
    const origin = new URL(site.siteUrl).origin;
    return origin + asset(site, pathname);
  } catch {
    return asset(site, pathname);
  }
}

export function initialOf(name) {
  const chars = Array.from(String(name || "L").trim());
  return (chars[0] || "L").toUpperCase();
}

export function postHref(site, post) {
  return asset(site, post.url);
}

export function tagHref(site, tag) {
  return asset(site, "/tags/" + encodeURIComponent(tag.slug) + "/");
}

export function categoryHref(site, name) {
  return asset(site, "/categories/" + encodeURIComponent(slugify(name, "category")) + "/");
}

export function avatarUrl(site) {
  if (!site.avatar) return "";
  if (/^https?:\/\//i.test(site.avatar)) return site.avatar;
  return asset(site, site.avatar);
}

export function coverUrl(site, post) {
  if (!post.cover) return "";
  if (/^https?:\/\//i.test(post.cover)) return post.cover;
  if (post.cover.startsWith("/")) return asset(site, post.cover);
  return asset(site, post.url + post.cover.replace(/^\.\//, ""));
}

export function pageHref(site, pageNumber) {
  return pageNumber <= 1 ? asset(site, "/posts/") : asset(site, "/posts/page/" + pageNumber + "/");
}
