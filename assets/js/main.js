(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "leleblog-theme";

  /* ---------------- theme ---------------- */

  var themeButton = document.querySelector("[data-theme-toggle]");
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        /* ignore */
      }
    });
  }

  /* ---------------- mobile nav ---------------- */

  var nav = document.getElementById("site-nav");
  var navToggle = document.querySelector("[data-nav-toggle]");
  if (nav && navToggle) {
    var closeNav = function () {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });
  }

  /* ---------------- code copy ---------------- */

  document.querySelectorAll("pre.code-block").forEach(function (pre) {
    var copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "code-copy";
    copyButton.setAttribute("aria-label", "复制代码");
    copyButton.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg><span>复制</span>';
    copyButton.addEventListener("click", function () {
      var code = pre.querySelector("code");
      if (!code) return;
      var text = code.innerText;
      var done = function () {
        copyButton.querySelector("span").textContent = "已复制";
        setTimeout(function () {
          copyButton.querySelector("span").textContent = "复制";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      }
    });
    pre.appendChild(copyButton);
  });

  /* ---------------- table of contents ---------------- */

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll("[data-toc-link]"));
  if (tocLinks.length) {
    var headingLinks = tocLinks
      .map(function (link) {
        var id = decodeURIComponent(link.getAttribute("href").slice(1));
        var target = document.getElementById(id);
        return target ? { link: link, target: target } : null;
      })
      .filter(Boolean);

    var tocBox = document.querySelector(".article-toc");

    var setActiveTocLink = function (activeLink) {
      tocLinks.forEach(function (link) {
        link.classList.toggle("is-active", link === activeLink);
      });

      if (!tocBox || !activeLink) return;
      var linkRect = activeLink.getBoundingClientRect();
      var boxRect = tocBox.getBoundingClientRect();
      if (linkRect.top < boxRect.top + 24 || linkRect.bottom > boxRect.bottom - 24) {
        tocBox.scrollTop += linkRect.top - boxRect.top - boxRect.height / 2 + linkRect.height / 2;
      }
    };

    var updateToc = function () {
      if (!headingLinks.length) return;
      var offset = 130;
      var active = headingLinks[0];
      for (var i = 0; i < headingLinks.length; i += 1) {
        if (headingLinks[i].target.getBoundingClientRect().top <= offset) {
          active = headingLinks[i];
        } else {
          break;
        }
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        active = headingLinks[headingLinks.length - 1];
      }
      setActiveTocLink(active.link);
    };

    var lastTocUpdate = 0;
    window.addEventListener(
      "scroll",
      function () {
        var now = Date.now();
        if (now - lastTocUpdate < 50) return;
        lastTocUpdate = now;
        updateToc();
      },
      { passive: true }
    );
    window.addEventListener("resize", updateToc);
    updateToc();
  }

  /* ---------------- search ---------------- */

  var layer = document.getElementById("search-layer");
  var input = document.getElementById("search-input");
  var resultsBox = document.getElementById("search-results");
  var countBox = document.getElementById("search-count");
  var openers = document.querySelectorAll("[data-open-search]");
  var closers = document.querySelectorAll("[data-close-search]");

  if (!layer || !input || !resultsBox) return;

  var index = null;
  var indexPromise = null;
  var activeIndex = -1;
  var currentResults = [];

  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  };

  var escapeRegExp = function (value) {
    return value.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
  };

  var normalize = function (value) {
    return String(value || "").toLowerCase();
  };

  var highlight = function (text, terms) {
    var safe = escapeHtml(text);
    terms.forEach(function (term) {
      if (!term) return;
      var pattern = new RegExp("(" + escapeRegExp(escapeHtml(term)) + ")", "gi");
      safe = safe.replace(pattern, "<mark>$1</mark>");
    });
    return safe;
  };

  var termsOf = function (query) {
    return normalize(query)
      .split(/\s+/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  };

  var search = function (query) {
    var terms = termsOf(query);
    if (!terms.length || !index) return [];
    var scored = [];
    index.forEach(function (post) {
      var title = normalize(post.title);
      var tags = normalize(post.tags.join(" "));
      var categories = normalize((post.categories || []).join(" "));
      var summary = normalize(post.summary);
      var text = normalize(post.text);
      var score = 0;
      for (var i = 0; i < terms.length; i += 1) {
        var term = terms[i];
        var hit = 0;
        if (title.indexOf(term) !== -1) hit += 12;
        if (categories.indexOf(term) !== -1) hit += 7;
        if (tags.indexOf(term) !== -1) hit += 6;
        if (summary.indexOf(term) !== -1) hit += 4;
        if (text.indexOf(term) !== -1) hit += 1;
        if (hit === 0) {
          score = -1;
          break;
        }
        score += hit;
      }
      if (score > 0) scored.push({ post: post, score: score });
    });
    return scored
      .sort(function (a, b) {
        return b.score - a.score || (a.post.date < b.post.date ? 1 : -1);
      })
      .slice(0, 30)
      .map(function (item) {
        return item.post;
      });
  };

  var snippet = function (post, terms) {
    var source = post.text || post.summary || "";
    var lower = source.toLowerCase();
    var at = -1;
    for (var i = 0; i < terms.length; i += 1) {
      var found = lower.indexOf(terms[i]);
      if (found !== -1 && (at === -1 || found < at)) at = found;
    }
    if (at === -1) return post.summary || "";
    var start = Math.max(0, at - 36);
    var end = Math.min(source.length, start + 150);
    return (start > 0 ? "…" : "") + source.slice(start, end).trim() + (end < source.length ? "…" : "");
  };

  var setSearchActive = function (nextIndex) {
    var nodes = resultsBox.querySelectorAll(".search-result");
    if (!nodes.length) return;
    activeIndex = (nextIndex + nodes.length) % nodes.length;
    nodes.forEach(function (node, i) {
      node.classList.toggle("is-active", i === activeIndex);
    });
    nodes[activeIndex].scrollIntoView({ block: "nearest" });
  };

  var render = function (posts, terms, query) {
    currentResults = posts;
    activeIndex = -1;
    countBox.textContent = String(posts.length);

    if (!query) {
      resultsBox.innerHTML =
        '<p class="search-empty">输入关键词开始搜索，支持标题、分类、标签与正文内容。</p>';
      return;
    }

    if (!posts.length) {
      resultsBox.innerHTML =
        '<p class="search-empty">没有找到与「' + escapeHtml(query) + '」相关的文章。</p>';
      return;
    }

    resultsBox.innerHTML = posts
      .map(function (post) {
        var categories = (post.categories || []).length
          ? "<span>" + escapeHtml(post.categories.join(" / ")) + "</span>"
          : "";
        var tags = post.tags
          .map(function (tag) {
            return "<span>#" + escapeHtml(tag) + "</span>";
          })
          .join("");
        return (
          '<a class="search-result" href="' +
          post.url +
          '">' +
          '<div class="search-result-title">' +
          highlight(post.title, terms) +
          "</div>" +
          '<div class="search-result-meta"><span>' +
          escapeHtml(post.date) +
          "</span>" +
          categories +
          tags +
          "</div>" +
          '<div class="search-result-snippet">' +
          highlight(snippet(post, terms), terms) +
          "</div>" +
          "</a>"
        );
      })
      .join("");
  };

  var runSearch = function () {
    var query = input.value.trim();
    if (!index) {
      resultsBox.innerHTML = '<p class="search-empty">正在加载搜索索引…</p>';
      loadIndex().then(function () {
        runSearch();
      });
      return;
    }
    render(search(query), termsOf(query), query);
  };

  var loadIndex = function () {
    if (index) return Promise.resolve(index);
    if (indexPromise) return indexPromise;
    var endpoint = document.body.getAttribute("data-search-index") || "/search-index.json";
    indexPromise = fetch(endpoint)
      .then(function (response) {
        if (!response.ok) throw new Error("search index failed");
        return response.json();
      })
      .then(function (data) {
        index = Array.isArray(data) ? data : [];
        return index;
      })
      .catch(function () {
        index = [];
        return index;
      });
    return indexPromise;
  };

  var openSearch = function () {
    layer.hidden = false;
    document.body.classList.add("search-open");
    input.value = "";
    render([], [], "");
    setTimeout(function () {
      input.focus();
    }, 10);
    loadIndex().then(function () {
      if (!input.value.trim()) {
        var recent = index.slice(0, 5);
        resultsBox.innerHTML = recent.length
          ? '<p class="search-hint-label">最近文章</p>' +
            recent
              .map(function (post) {
                return (
                  '<a class="search-result" href="' +
                  post.url +
                  '"><div class="search-result-title">' +
                  escapeHtml(post.title) +
                  '</div><div class="search-result-meta"><span>' +
                  escapeHtml(post.date) +
                  "</span></div></a>"
                );
              })
              .join("")
          : '<p class="search-empty">搜索索引还没有内容。</p>';
      }
    });
  };

  var closeSearch = function () {
    layer.hidden = true;
    document.body.classList.remove("search-open");
    currentResults = [];
    activeIndex = -1;
  };

  openers.forEach(function (button) {
    button.addEventListener("click", openSearch);
  });
  closers.forEach(function (button) {
    button.addEventListener("click", closeSearch);
  });

  input.addEventListener("input", runSearch);

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchActive(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchActive(activeIndex - 1);
    } else if (event.key === "Enter") {
      var nodes = resultsBox.querySelectorAll(".search-result");
      if (nodes.length) {
        event.preventDefault();
        (nodes[activeIndex >= 0 ? activeIndex : 0]).click();
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    var target = event.target;
    var typing =
      target &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
    if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (layer.hidden) openSearch();
      else closeSearch();
      return;
    }
    if (event.key === "/" && !typing && layer.hidden) {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key === "Escape" && !layer.hidden) {
      closeSearch();
    }
  });

  /* ---------------- expose ---------------- */

  window.LeleBlog = {
    openSearch: openSearch,
    closeSearch: closeSearch
  };
})();
