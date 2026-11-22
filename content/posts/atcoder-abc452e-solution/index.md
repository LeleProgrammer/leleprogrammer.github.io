---
title: "题解：AT_abc452_e [ABC452E] You WILL Like Sigma Problem"
date: 2026-04-07
tags: ["OI"]
categories: ["OI","题解","AtCoder"]
---
## 思路

求 $\sum\limits_{i=1}^N \sum\limits_{j=1}^M (A_i \times B_j \times (i \bmod j))$ 的值。

不妨变换一下求和顺序：$\sum\limits_{j=1}^M (B_j \times \sum\limits_{i=1}^N (A_i \times (i \bmod j)))$。

假设现在 $j$ 是确定的，那么 $i=1,2,3,\cdots$ 的 $A_i$ 的贡献是可以求的。比如说 $j=4$，那么 $i=1,2,3,\cdots$ 的 $A_i$ 贡献次数依次是 $1,2,3,0,1,2,3,0,1,2,3,0,\cdots$，那么我们只要维护 $a$ 的前缀和以及 $p_i = \sum\limits_{j=1}^i (i \times A_i)$，就可以快速求得每一个形如 $1,2,3,4,\cdots,k-1,k,0$ 的区间答案。

当 $j=1,2,3,\cdots$ 时，每次能覆盖的区间长度就是 $1,2,3,\cdots$，因此对于每个 $j$，$i$ 都直接扫一遍，复杂度是对数级别的。

## 代码

```cpp
int n,m,ans;
int a[N],b[N];
int pre[N],s[N];

inline int solve(int l,int r) {
    return (pre[r-1]-pre[l-1]-(l-1)*(s[r-1]-s[l-1]))%mod;
}

i32 main() {
    read(n,m);
    _rep(i,1,n) read(a[i]);
    _rep(i,1,m) read(b[i]);
    _rep(i,1,N-1) pre[i]=(pre[i-1]+a[i]*i)%mod,s[i]=(s[i-1]+a[i])%mod;
    _rep(i,2,m) {
        int l=1,r=i;
        while (l<=n) ans=(ans+solve(l,r)*b[i])%mod,l+=i,r+=i;
    }
    ans=(ans%mod+mod)%mod;
    write(ans);
    return 0;
}
```
