import MarkdownIt from "markdown-it";
import multimdTable from "markdown-it-multimd-table";
import strikethrough from "markdown-it-strikethrough-alt";
import texmath from "markdown-it-texmath";
import katex from "katex";
import hljs from "highlight.js";
import { escapeHtml, slugify } from "./utils.mjs";

const KATEX_OPTIONS = {
  throwOnError: false,
  strict: "ignore",
  trust: false,
  output: "html"
};

function highlightCode(code, lang) {
  const language = String(lang || "").trim().split(/\s+/)[0];
  let body;
  if (language && hljs.getLanguage(language)) {
    body = hljs.highlight(code, { language, ignoreIllegals: true }).value;
  } else {
    body = escapeHtml(code);
  }
  const label = language || "text";
  return '<pre class="code-block" data-lang="' + escapeHtml(label) + '"><code class="hljs">' + body + "</code></pre>";
}

function installHeadingIds(md) {
  md.core.ruler.push("heading_ids", (state) => {
    const used = new Map();
    for (let i = 0; i < state.tokens.length; i += 1) {
      const token = state.tokens[i];
      if (token.type !== "heading_open") continue;
      const inline = state.tokens[i + 1];
      const text = inline && inline.type === "inline" ? inline.content : "";
      const base = slugify(text, "section");
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      token.attrSet("id", count === 0 ? base : base + "-" + (count + 1));
    }
  });
}

function extractHeadings(tokens) {
  const headings = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    const level = Number(token.tag.slice(1));
    if (level < 2 || level > 3) continue;
    const inline = tokens[i + 1];
    headings.push({
      level,
      id: token.attrGet("id") || "",
      text: inline && inline.type === "inline" ? inline.content : ""
    });
  }
  return headings;
}

function tokensToPlainText(tokens) {
  const parts = [];
  for (const token of tokens) {
    if (token.type === "inline") {
      for (const child of token.children || []) {
        if (child.type === "text" || child.type === "code_inline") {
          parts.push(child.content);
        } else if (child.type === "softbreak" || child.type === "hardbreak") {
          parts.push(" ");
        }
      }
    } else if (token.type === "fence" || token.type === "code_block") {
      parts.push(token.content);
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function createMarkdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    highlight: highlightCode
  });

  md.use(multimdTable, {
    multiline: true,
    rowspan: true,
    headerless: false,
    multibody: false,
    autolabel: false
  });

  md.use(strikethrough);

  md.use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: KATEX_OPTIONS
  });

  const renderInlineMath = (tokens, idx) =>
    katex.renderToString(String(tokens[idx].content || "").trim(), {
      ...KATEX_OPTIONS,
      displayMode: false
    });
  const renderBlockMath = (tokens, idx) =>
    '<div class="math-display">' +
    katex.renderToString(String(tokens[idx].content || "").trim(), {
      ...KATEX_OPTIONS,
      displayMode: true
    }) +
    "</div>";

  md.renderer.rules.math_inline = renderInlineMath;
  md.renderer.rules.math_inline_double = renderInlineMath;
  md.renderer.rules.math_block = renderBlockMath;
  md.renderer.rules.math_block_eqno = renderBlockMath;

  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet("loading", "lazy");
    tokens[idx].attrSet("decoding", "async");
    return defaultImage(tokens, idx, options, env, self);
  };

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet("href") || "";
    if (/^https?:\/\//i.test(href)) {
      tokens[idx].attrSet("target", "_blank");
      tokens[idx].attrSet("rel", "noopener noreferrer");
    }
    return self.renderToken(tokens, idx, options);
  };

  installHeadingIds(md);

  md.renderWithMeta = (source) => {
    const env = {};
    const tokens = md.parse(source, env);
    const html = md.renderer.render(tokens, md.options, env);
    return {
      html,
      headings: extractHeadings(tokens),
      plain: tokensToPlainText(tokens)
    };
  };

  return md;
}
