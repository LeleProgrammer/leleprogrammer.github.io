---
title: "题解：AT_abc449_f [ABC449F] Grid Clipping"
date: 2026-03-19 21:22:08
tags: ["OI","扫描线"]
categories: ["OI","题解","AtCoder"]
---
前置知识：[扫描线，矩阵面积并](https://www.luogu.com.cn/problem/P5490)。

## 思路

如果 $(i,j)$ 是黑色格子，那就说明 $x \in [i-h+1,i], y \in [j-w+1,j]$ 的 $(x,y)$ 不能作为子矩阵的左上角。我们把 $x \in [i-h+1,i], y \in [j-w+1,j]$ 作为一个矩阵，求以上矩阵面积并，就是不能作为子矩阵左上角的格子数量。

整个矩阵中可以被作为子矩阵左上角的格子数量有 $(H-h+1) \times (W-w+1)$ 个，这个东西减去上面求出的矩阵面积并就是最终答案。
