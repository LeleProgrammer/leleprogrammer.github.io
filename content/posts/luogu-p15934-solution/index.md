---
title: "题解：洛谷 P15934 [TOPC 2021] Flip"
date: 2026-04-03 13:48:11
tags: ["OI","TOPC","线段树"]
categories: ["OI","题解","洛谷"]
---
前置知识：线段树。

## 思路

首先我们**维护一个区间的方案数**，如果我们已经知道一个线段树节点所属区间的方案数，可以将其上传到父节点，但不难发现对于父节点我们还需要计算跨越两个子节点的贡献。

当左儿子的最右侧与右儿子的最左侧不相等，那么可以产生贡献，在判断有没有贡献这里，我们需要维护的内容就多了两个：**区间最左侧的值和最右侧的值**。

那么贡献怎么算呢？假设左儿子的最长可行后缀为 $rlen$，右儿子的最长可行前缀为 $llen$，不难发现贡献就是 $rlen \times llen$，因此，我们要维护的内容还有两个：**最长可行前后缀**。

上面这两个内容如何更新呢？以 $llen$ 为例，如果左儿子的 $llen$ 就是左儿子的长度，并且左儿子的最右侧与右儿子的最左侧不同，那么 $llen$ 就是左儿子长度与右儿子的 $llen$ 的和，$rlen$ 同理。

区间反转是一个很经典的操作了，这里不过多讲解，因此我们还需要一个懒标记：**反转标记**。

至此，这道题就做完了。

## 代码

只提供线段树核心部分代码：

```cpp
struct val {
    int l,r;
    int llen,rlen,sum;
    int L,R;
    int flp;
    val(): l(0),r(0),llen(0),rlen(0),sum(0),L(0),R(0),flp(0) {}
};

inline void pushup(val& u,val& l,val& r) {
    u.sum=l.sum+r.sum;
    if (l.llen==l.r-l.l+1 && l.R!=r.L) u.llen=l.r-l.l+1+r.llen;
    else u.llen=l.llen;
    if (r.rlen==r.r-r.l+1 && l.R!=r.L) u.rlen=r.r-r.l+1+l.rlen;
    else u.rlen=r.rlen;
    u.L=l.L;
    u.R=r.R;
    if (l.R!=r.L) u.sum+=l.rlen*r.llen;
}

inline void pushdown(val& u,val& l,val& r) {
    if (u.flp) {
        l.flp^=1,r.flp^=1;
        l.L^=1,l.R^=1;
        r.L^=1,r.R^=1;
        u.flp=0;
    }
}
```
