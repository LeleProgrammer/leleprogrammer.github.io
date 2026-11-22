---
title: "题解：洛谷 P15800 [GESP202603 六级] 选数"
date: 2026-03-16
tags: ["OI","DP"]
categories: ["OI","题解","洛谷"]
---
## 思路

对于第 $i$ 个位置，求出当 $i$ 可以被取的情况下最大和是 $f_i$，那么 $f_{i+b_{p_i}}$ 就可以跟 $f_i + a_i$ 取 $\max$，但是我们需要更新的是一个后缀的关系，也就是一个 $f$ 一旦启用，后面的位置也能用这个 $f$，所以写个 $cur$ 维护前缀 $\max f$。

注意有个坑点，当 $b_i=0$ 时，自身 $f_i$ 会被更新，所以在更新完 $i$ 的答案后，$cur$ 要再次与 $f_i$ 取 $\max$。

## 代码

```cpp
template<typename A,typename B> inline void chmax(A& a,const B& b) { (a<b)?(a=b):a; }
#define _rep(i,a,b) for (int i=(a);i<=(b);++i)

int n,ans;
int a[N],b[N];
int f[N];
int cur;

i32 main() {
    read(n);
    _rep(i,1,n) read(a[i]);
    _rep(i,1,n) read(b[i]);
    _rep(i,1,n) chmax(cur,f[i]),chmax(f[i+b[i]],cur+a[i]),chmax(cur,f[i]);
    _rep(i,1,n<<1) chmax(ans,f[i]);
    write(ans);
    return 0;
}
```
