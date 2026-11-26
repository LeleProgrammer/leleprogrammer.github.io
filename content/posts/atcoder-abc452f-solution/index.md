---
title: "题解：AT_abc452_f [ABC452F] Interval Inversion Count"
date: 2026-04-07 07:41:33
tags: ["OI","树状数组"]
categories: ["OI","题解","AtCoder"]
---
简单题，赛时 $8$ 分钟不到就切了。

## 思路

求逆序对数量恰好为 $K$ 的区间数量。

不难发现，如果右端点固定，那么随着左端点向右收缩，逆序对数量是单调不增的，所以我们自然想到：找到逆序对数量 $\le K$ 的最大值的出现位置，以及 $< K$ 的最大值的出现位置，两者相减，就是该右端点对答案的贡献。而找到这两个位置也是简单的，直接双指针扫一下即可。逆序对的维护方式也很经典，树状数组即可完成。

注意特判 $K=0$ 的情况。

## 代码

```cpp
int n,k,ans;
int p[N];
BIT<int> tr(N),tr2(N);
int fir[N],las[N];

i32 main() {
    read(n,k);
    _rep(i,1,n) read(p[i]);
    if (!k) {
        _rep(l,1,n) {
            int r=l;
            while (r+1<=n && p[r+1]>=p[r]) r++;
            ans+=(r-l+2)*(r-l+1)/2;
            l=r;
        }
        write(ans);
        return 0;
    }
    int l=1,cur=0;
    _rep(r,1,n) {
        cur+=tr.query(N-1)-tr.query(p[r]);
        tr.modify(p[r],1);
        while (cur>k) {
            cur-=tr.query(p[l]-1);
            tr.modify(p[l],-1);
            l++;
        }
        fir[r]=l;
    }
    l=1,cur=0;
    _rep(r,1,n) {
        cur+=tr2.query(N-1)-tr2.query(p[r]);
        tr2.modify(p[r],1);
        while (cur>=k) {
            cur-=tr2.query(p[l]-1);
            tr2.modify(p[l],-1);
            l++;
        }
        las[r]=l;
    }
    int ans=0;
    _rep(i,1,n) ans+=las[i]-fir[i];
    write(ans);
    return 0;
}
```
