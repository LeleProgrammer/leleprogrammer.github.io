---
title: "题解：P16480 [GKS 2014 #A] Cut Tiles"
date: 2026-08-09
tags: ["OI","数学","Google Kick Start"]
categories: ["OI","题解","洛谷"]
---
## 思路

考虑如何切割 $M \times M$ 的瓷砖，使其浪费最少。

由于切出来的都是正方形瓷砖，那么我们可以只看其中一条边。

把 $M$ 拆分成 $2$ 的若干次方的和，并且每次尽可能让这个 $2$ 的次方数更大，这样拆分是最优的。证明如下：大块的可以拆成小块的，如 $2^i$ 可以拆分成两个 $2^{i-1}$，那么平方一下就是四块，但小块的不一定可以拼成大块的，如 $2^3,2^4$ 这样次方不同的很难凑在一起。

不难发现，其实就是直接求 $M$ 在二进制表示下，位为 $1$，即进行拆分，比如样例 $M=277$ 我们拆分成 $256+16+4+1$，一条边拆分，那么两条边平方合并一下即可。比如说 $2^4$ 与 $2^8$ 合并，这是矩形，所以我们拆分成 $16$ 个 $2^4 \times 2^4$ 的正方形即可。

从大到小考虑每一个 $s$，另外用一个数组记录拆分出来的 $2^i \times 2^i$ 的正方形有多少个，把 $i>s$ 的部分一直拆开即可。

复杂度是两个 $\log$ 的。

## 代码

省去了火车头，添加了一些必要的注释。

```cpp
int T,n,m;
int s[N];
int rem[M];

i32 main() {
    read(T);
    _rep(tt,1,T) {
        memset(rem,0,sizeof(rem));
        read(n,m);
        _rep(i,1,n) read(s[i]);
        _rsorta(s,1,n); // 降序排序
        int ans=0;
        _rep(k,1,n) { // for k: 1 -> n
            _rrep(i,M-1,s[k]+1) rem[i-1]+=rem[i]*4,rem[i]=0; // for i: M-1 -> s[k]+1
            if (!rem[s[k]]) {
                ans++;
                _rep(i,0,M-1) _rep(j,0,M-1) if (kthbit(m,i) && kthbit(m,j)) { // kthbit(a,b) 获取 a 的第 b 位，最低位为 b=0
                    int mn=min(i,j),mx=max(i,j);
                    rem[mn]+=(1LL<<mx)/(1LL<<mn);
                }
            }
            _rrep(i,M-1,s[k]+1) rem[i-1]+=rem[i]*4,rem[i]=0;
            rem[s[k]]--;
        }
        printf("Case #%lld: ",tt);
        writeln(ans);
    }
    return 0;
}
```
