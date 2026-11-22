---
title: "题解：CF2254C1 Marenol (easy version)"
date: 2026-08-08
tags: ["OI"]
categories: ["OI","题解","Codeforces"]
---
## 思路

不难发现操作等价于选定 $i$ 然后交换 $i$ 和 $i+2$。

那么下标为奇数的数就只能在奇数下标移动，偶数同理，那么记 $A_0$ 为 $a_2,a_4,a_6,\cdots$，$A_1$ 为 $a_1,a_3,a_5,\cdots$，$B_0,B_1$ 同理，然后分别排序。最后判断 $A_0=B_0 \land A_1=B_1$ 是否成立即可。
