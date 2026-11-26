---
title: "题解：CF2254F Whiplash"
date: 2026-08-08 13:11:51
tags: ["OI"]
categories: ["OI","题解","Codeforces"]
---
## 思路

$n$ 是偶数，这是一个重要的条件。

假设初始序列是 $a_1,a_2,a_3,a_4,\cdots$，我们先对 $i$ 操作，设 $p \neq i$，则序列变为：

$$
\begin{align*}
a'_p&=a_p \oplus a_i \\
a'_i&=a_i \\
\end{align*}
$$

然后对 $j$ 操作，不妨设 $j>i$，且 $p \neq i, p \neq j$，则：

$$
\begin{align*}
a''_p&=(a_p \oplus a_i) \oplus (a_j \oplus a_i) \\
a''_i&=a_i \oplus (a_j \oplus a_i) \\
a''_j&=a_j \oplus a_i \\
\end{align*}
$$

化简得：

$$
\begin{align*}
a''_p&=a_p \oplus a_j \\
a''_i&=a_j \\
a''_j&=a_j \oplus a_i \\
\end{align*}
$$

然后再对 $i$ 操作，可得：

$$
\begin{align*}
a'''_p&=a_p \\
a'''_i&=a_j \\
a'''_j&=a_i \\
\end{align*}
$$

不难发现，$i \rightarrow j \rightarrow i$ 的操作等价于交换 $i,j$ 的位置，所以如果给定序列 $a,b$ 在排序后相同，则可行。

那如果不相同呢？这里用到了 $n$ 是偶数的限制，一次操作会影响 $n-1$ 个数字，而 $n-1$ 是奇数，则整个序列的异或和会受到影响，那么我们只需要求出 $(\bigoplus a) \oplus (\bigoplus b)$ 就能知道 $a$ 还需要再异或一个什么数，如果 $a$ 中找不出这样的数，就无解，否则的话，对 $a_i = (\bigoplus a) \oplus (\bigoplus b)$ 的一个 $i$ 进行一次操作，然后看 $a,b$ 排序后是否相等即可。
