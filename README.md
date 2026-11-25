# LeleBlog

一个纯静态的个人博客：HTML + CSS + 原生 JavaScript，构建脚本使用 Node.js，没有前端框架。

- 深色为主、可切换浅色主题
- Markdown 写作，构建时渲染 KaTeX 数学公式（不需要外网 CDN）
- 代码块语法高亮（highlight.js 构建时渲染）与一键复制
- 文章分类、标签、归档、全文搜索、RSS、站点地图
- 文章可选封面大图，文内图片与文章同目录
- GitHub Actions 自动部署到 GitHub Pages

## 快速开始

需要 Node.js 20+（推荐 22 LTS）。

```bash
npm install
npm run dev
```

打开 http://localhost:4321 预览。修改内容会自动重新构建并刷新页面。

Windows 下也可以直接双击项目根目录的 **start.bat**：它会自动执行 npm install 并启动本地预览。

其他命令：

```bash
npm run build     # 生成静态站点到 dist/
npm run preview   # 本地预览已构建的 dist/
npm run check     # 检查构建结果里的内部链接与资源
npm run clean     # 删除 dist/
```

## 目录结构

```
.
├─ site.config.json          站点配置（主要改这里）
├─ content/
│  ├─ posts/
│  │  └─ csps-2026-t3-solution/
│  │     ├─ index.md         文章正文与 frontmatter
│  │     ├─ 1.png … 7.png    文内图片（可直接放文章目录）
│  │     └─ cover.jpg        可选的文章封面大图
│  └─ pages/
│     └─ about.md            关于页
├─ assets/                   CSS、JS、图片（头像/背景等）、favicon
├─ scripts/                  构建脚本（build / dev / serve）
├─ .github/workflows/        GitHub Pages 自动部署
└─ dist/                     构建产物（已加入 .gitignore）
```

## 修改站点信息

所有站点级信息都在 **site.config.json** 里，改完重新构建或等 dev 自动刷新即可。

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| siteName | "LeleBlog" | 站点名称，显示在导航、页脚和标题里 |
| siteDescription | "" | 站点简介，显示在首页、页脚和 SEO 描述中 |
| author | "Lele" | 作者名 |
| avatar | "" | 作者头像，例如 /assets/images/avatar.jpg；留空则显示首字母 |
| email | "" | 邮箱，留空则不显示邮件入口 |
| github | "" | GitHub 用户名或完整链接，留空则不显示 |
| siteUrl | "" | 部署后的完整地址，例如 https://name.github.io/LeleBlog/ |
| basePath | "" | 子路径，通常留空，会从 siteUrl 自动推导 |
| language | "zh-CN" | 页面语言 |
| defaultTheme | "dark" | 默认主题，可设为 "light" |
| startYear | 2025 | 页脚版权起始年份 |
| postsPerPage | 8 | 每页文章数 |
| footerNote | "" | 页脚补充说明 |
| icp | "" | ICP 备案号，留空则不显示 |
| backgroundImage | "/assets/images/bg.jpg" | 网站背景大图，留空则关闭 |
| backgroundBrightness | 0.7 | 背景图可见亮度，0–1，越大越亮 |
| profileButtons | 见下文 | 个人资料卡按钮列表，可增删、排序、隐藏 |

> siteUrl 只影响 canonical、RSS、sitemap 里的绝对地址；不填也能正常浏览，但订阅源不够规范，而且不会生成 sitemap.xml。

### 背景大图

把图片放进 `assets/images/`（构建时会整个目录复制到站点），然后设置：

```json
{
  "backgroundImage": "/assets/images/bg.jpg",
  "backgroundBrightness": 0.7
}
```

- `backgroundImage` 留空则关闭背景，恢复纯色渐变。
- 支持站点内路径（以 `/` 开头）或完整的外链图片地址。
- `backgroundBrightness` 是背景图可见亮度：1 为原图，0 接近全黑；数字越大图越亮。旧配置里的 backgroundDim 会自动换算成 1 - backgroundDim。
- 当前站点使用的是迁移过来的 `assets/images/bg.jpg`；换图时替换文件或修改路径即可。

### 个人资料卡按钮

`site.config.json` 的 `profileButtons` 是一个数组，顺序就是页面上的显示顺序。默认配置：

```json
{
  "profileButtons": [
    { "type": "github", "label": "GitHub", "url": "", "visible": true },
    { "type": "gamepad", "label": "游戏站", "url": "", "visible": true },
    { "type": "luogu", "label": "洛谷", "url": "", "visible": true },
    { "type": "rss", "label": "RSS", "url": "/rss.xml", "visible": true }
  ]
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| type | 图标类型：github、gamepad、luogu、rss、mail、link；未知类型使用通用链接图标 |
| label | 按钮文字 |
| url | 跳转地址。外链写完整 https://...；站内路径写 /rss.xml 这类以斜杠开头的地址 |
| visible | false 时完全不显示；true 时显示 |

补充规则：

- 只保留想展示的按钮即可；也可以保留数组项并设 `visible: false`。
- `visible: true` 但 `url` 为空时，按钮会显示为不可点击的占位状态；部署前记得填地址。
- GitHub 按钮的 `url` 为空时，会自动尝试使用上面的 `github` 字段。
- 外链按钮自动新窗口打开；站内路径自动带上 `basePath`。

### 字号与配色

- 字号都写在 `assets/css/style.css`：导航是 `.nav-link`，正文是 `.prose`，卡片标题是 `.post-card-title`，文章标题是 `.article-title`；移动端覆盖在文件底部的 `@media (max-width: 760px)` 里。
- 主色、渐变、圆角等集中在文件顶部的 CSS 变量（`--accent`、`--gradient`、`--radius-lg` 等）。
- 背景图的亮度用 `site.config.json` 的 `backgroundBrightness` 调整，不需要改 CSS。

## 写一篇文章

1. 在 `content/posts/` 下新建一个文件夹，文件夹名就是 URL 里的 slug，例如 `hello-world/`。
2. 在文件夹里新建 `index.md`。
3. 图片直接放在同一目录（推荐放 `images/` 子目录），Markdown 里用相对路径引用。

```markdown
---
title: 文章标题
date: 2026-11-22
updated: 2026-11-23
tags: [Markdown, 教程]
categories: [OI, 题解]
summary: 一句话摘要，会显示在列表卡片和搜索结果里。
cover: cover.png
coverAlt: 封面图的替代文字
draft: false
---

正文从这里开始。
```

frontmatter 字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| title | 是 | 文章标题 |
| date | 建议 | 发布日期，格式 YYYY-MM-DD；不写时使用文件修改时间 |
| updated | 否 | 更新日期 |
| tags | 否 | 标签数组，支持中文 |
| categories | 否 | 分类路径数组，例如 ["OI", "题解", "洛谷"] |
| summary | 否 | 摘要，留空时自动截取正文 |
| cover | 否 | 封面图相对路径；不写就没有大图 |
| coverAlt | 否 | 封面图的 alt 文本 |
| draft | 否 | 为 true 时只在 dev 模式显示，正式构建会跳过 |

### 分类与标签

分类和标签是两套独立体系：

- **分类**会自动生成 `/categories/` 总览和每个分类的详情页，支持多级路径（例如 `OI / 题解 / 洛谷`）。导航栏的「分类」进入总览，文章页标题上方显示分类路径。
- **标签**走 `/tags/`，用于更细的主题标记，文章卡片底部显示。

### 图片与封面

文章 URL 是 `/posts/<slug>/`，构建时会把文章目录里的文件原样复制到同一路径。因此：

```markdown
![构建流程](images/flow.png)
```

会指向 `/posts/<slug>/images/flow.png`。

**封面大图**默认没有。在 frontmatter 里加一行 `cover: cover.png` 就会在文章页顶部显示大图，并作为首页卡片缩略图；删掉这一行即可关闭。建议尺寸 1600×900 左右。

## Markdown 与公式

- 支持 CommonMark、表格、删除线、围栏代码块
- 代码块按语言高亮，悬停可复制
- 行内公式：`$E = mc^2$`
- 块级公式：单独成段写 `$$ ... $$`
- 只想写美元符号时用 `\$` 转义，例如 `\$5`
- 允许直接写 HTML（例如 `<details>`）
- 标题会自动生成锚点，右侧「本文目录」会按 h2 / h3 生成树状结构，并随滚动实时高亮当前位置

公式在构建时由 KaTeX 渲染成静态 HTML，字体文件随站点一起发布，不依赖 Google Fonts 或 CDN。

整站不引用任何外部 CSS、JS 或字体 CDN：KaTeX 字体、代码高亮、图标全部在本地。`npm run check` 会额外检查构建产物里是否存在外部静态资源。

Markdown 正文里如果引用外链图片，浏览器仍会直接加载对方资源；想彻底离线，把图片下载到文章目录再引用即可。

迁移时保留了 2 张洛谷 CDN 上的文章配图（2025 JZ Summer Camp、CF2253E）；其余图片都在本地。

## 搜索

构建时生成 `/search-index.json`，浏览器端做打分匹配，不需要后端。入口：

- 点击导航栏「搜索」
- 快捷键 `Ctrl + K` / `⌘ + K`
- 在非输入状态下按 `/`

## 部署到 GitHub Pages

### 1. 先填好配置

打开 `site.config.json`，至少填这两项：

```json
{
  "siteUrl": "https://<你的用户名>.github.io/LeleBlog/",
  "github": "<你的用户名>"
}
```

- 仓库名是 `LeleBlog` 这类普通仓库：地址形如 `https://用户名.github.io/LeleBlog/`，`basePath` 留空即可，会自动推导成 `/LeleBlog`。
- 仓库名是 `用户名.github.io`：地址形如 `https://用户名.github.io/`，同样留空 `basePath`。

### 2. 在 GitHub 创建仓库

新建一个 public 仓库，例如 `LeleBlog`。不要勾选自动生成 README，避免和本地冲突。

### 3. 在本地初始化并推送

在博客项目目录执行：

```bash
git init
git add .
git commit -m "init LeleBlog"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

如果 push 时要求登录，使用 GitHub 的 Personal Access Token 作为密码，或者改用 SSH 地址。

### 4. 开启 GitHub Pages

进入仓库 **Settings → Pages → Build and deployment**，把 **Source** 设为 **GitHub Actions**。

不需要手动选择分支，仓库里的 `.github/workflows/deploy.yml` 会在每次 push 到 `main` 时自动构建并发布。

### 5. 等待部署完成

打开仓库的 **Actions** 标签页，看到 Deploy to GitHub Pages 变绿后，访问：

```
https://<你的用户名>.github.io/<仓库名>/
```

### 6. 日常更新

```bash
git add .
git commit -m "add: 新文章"
git push
```

推送后 Actions 会自动重新构建，一两分钟后线上更新。也可以在 Actions 页面点 **Run workflow** 手动触发。

## 常见问题

**公式没有渲染，还是美元符号？**
检查 `$` 是否成对；块级公式建议单独成段，前后留空行；`$$` 不要紧贴文字。

**图片 404？**
确认图片在文章目录内、Markdown 里的相对路径大小写一致，然后重新构建。构建日志会提示缺失的图片。

**部署后样式或链接错乱？**
多半是 `siteUrl` 和实际地址不一致。项目仓库记得带上仓库名，例如 `/LeleBlog/`。

**Actions 变绿了，但访问是 GitHub 的 “Site not found” 404？**
先确认 **Settings → Pages → Build and deployment → Source** 真的是 **GitHub Actions**，而不是 **Deploy from a branch**。

如果 Actions 列表里同时出现 `pages build and deployment`，并且步骤里有 **Build with Jekyll**，说明 Pages 还在按分支发布。新项目的根目录只有源码，没有 `index.html`（页面在 `dist/` 里，由 Actions 上传），Jekyll 发布出来就是空站，所以会 404。

切到 **GitHub Actions** 后，再重新运行一次 **Deploy to GitHub Pages**（Re-run all jobs），或者 push 一次触发新构建；只改设置、不重新部署，线上可能仍停留在上一次的空发布。

**想换强调色或字体？**
颜色集中在 `assets/css/style.css` 顶部的 CSS 变量里（`--accent`、`--gradient` 等），字体在 `--font-sans`。

**代码块怎么高亮？**
在围栏代码块的语言位置写语言名，例如 `` ```cpp ``、`` ```python ``、`` ```js ``，构建时会用 highlight.js 生成高亮；不写语言名则按纯文本显示。

语法配色在 `assets/css/highlight.css`，代码块背景、字号和复制按钮在 `assets/css/style.css` 的 `.prose pre` 一节。

**评论系统？**
当前没有接入。纯静态站可以后续接 Giscus（GitHub Discussions）或 Waline，需要时再加。

## 技术栈

- Node.js 构建脚本，无框架、无运行时依赖
- markdown-it + markdown-it-multimd-table + markdown-it-strikethrough-alt
- KaTeX（构建时渲染）、highlight.js、gray-matter
- 原生 CSS 变量与少量原生 JavaScript（主题、搜索、目录、代码复制）

## 许可证与文章版权

LeleBlog 的项目代码采用 GNU Affero General Public License v3.0（仅限第 3 版，`AGPL-3.0-only`）。完整条款见 [LICENSE](LICENSE)。

本站原创文章 © Lele，保留所有权利。第三方内容及素材的权利归各自权利人所有。
