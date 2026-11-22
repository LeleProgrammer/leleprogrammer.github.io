---
title: "Beamer 使用指南"
date: 2025-08-17
tags: ["Latex","Beamer"]
categories: ["教程"]
---
## 建立一个最简单的页面

```latex
\documentclass[UTF8]{ctexbeamer}

\usepackage{amsmath} % 基本数学支持
\usepackage{amssymb} % 数学符号扩展
\usefonttheme[onlymath]{serif}
\usetheme{Madrid}

% 这是注释

\title{Document Title}
\subtitle{Sub Title}
\author{Lele}
\institute{Shantou Jinshan Senior High School}
\date{2025.08.17}

\begin{document}
    \frame{\titlepage}
    \begin{frame}
        \frametitle{Sample Frame Title}
        This is some text. 中文测试中文测试。
    \end{frame}
\end{document}
```

### 代码详解

首先需要声明 beamer，并让它支持 UTF8。

```latex
\documentclass[UTF8]{ctexbeamer}
```

然后可以引入一些必要的 package，设置字体，设置样式等等。

```latex
\usepackage{amsmath} % 基本数学支持
\usepackage{amssymb} % 数学符号扩展
\usefonttheme[onlymath]{serif}
\usetheme{Madrid}
```

我们可以通过百分号来标明注释。

```latex
% 这是注释
```

对于标题页，我们可以用如下方式设置标题、副标题、作者、机构、时间

```latex
\title{Document Title}
\subtitle{Sub Title}
\author{Lele}
\institute{Shantou Jinshan Senior High School}
\date{2025.08.17}
```

然后在如下内容中写入文档内容。

```latex
\begin{document}
    \frame{\titlepage} % 通过这个来展示标题页面
    ...
\end{document}
```

我们可以通过这样子来创建一个页面。

```latex
\begin{frame}
    ...
\end{frame}
```

然后写页面标题。

```latex
\frametitle{这是标题}
```

## 特效

类似 PPT，在同一个 frame 里面，设置某些元素的可见性先后顺序。

```latex
\begin{frame} % 创建一个页面
    \frametitle{Title} % 设置标题
    测试特效可见性。
    \begin{itemize} % 这是一个列表
        % 用尖括号里面包含一个数字来表示出现顺序
        % 如果数字后带一个减号，说明从第 k 次开始保持可见
        % 否则仅第 k 次可见
        \item<1-> 文字一
        \item<2-> 文字二
        \item<3> 文字三
        \item<4-> 文字四
    \end{itemize}
\end{frame}
```

## 目录页

在每一个 Section 前面都显示当前目录页，可以在 `\begin{document}` 前写入如下代码：

```latex
\AtBeginSection[]
{
    \begin{frame}
        \frametitle{Contents}
        \tableofcontents[currentsection]
    \end{frame}
}
```

然后对于每一个 Section，我们需要添加：

```latex
\section{Section Title}
```

一个小小的样例：

```latex
\documentclass[UTF8]{ctexbeamer}

\usepackage{amsmath} % 基本数学支持
\usepackage{amssymb} % 数学符号扩展
\usefonttheme[onlymath]{serif}
\usetheme{Madrid}

% 这是注释

\title{Document Title}
\subtitle{Sub Title}
\author{Lele}
\institute{Shantou Jinshan Senior High School}
\date{2025.08.17}

\AtBeginSection[]
{
    \begin{frame}
        \frametitle{Contents}
        \tableofcontents[currentsection]
    \end{frame}
}

\begin{document}
    \frame{\titlepage}
    \section{Section 1}
    \begin{frame}
        \frametitle{Sample Frame Title}
        This is some text. 中文测试中文测试。
    \end{frame}
    \begin{frame}
        \frametitle{Title}
        测试特效可见性。
        $x^n+y^n=z^n$
        \begin{itemize}
            \item<1-> 文字一
            \item<2-> 文字二
            \item<3> 文字三
            \item<4-> 文字四
        \end{itemize}
    \end{frame}
    \section{Section 2}
    \begin{frame}
        \frametitle{Title 2}
        Blablabla...
    \end{frame}
\end{document}
```
