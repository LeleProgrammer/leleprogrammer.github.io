---
title: "题解：CF2254E Chronostasis"
date: 2026-08-08
tags: ["OI"]
categories: ["OI","题解","Codeforces"]
---
## 思路

题意简述：给定一个差分数组，我们可以任意重排这个数组，使得原序列都是正整数且字典序最小。

初始 $cur=0$，每次我们找到 $> -cur$ 的最小整数 $k$ 填入新的位置，然后 $cur \leftarrow cur+k$，用 `multiset` 维护即可。

如果按照上述方法不能填满整个序列，则无解。
