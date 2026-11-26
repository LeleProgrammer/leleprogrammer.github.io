---
title: "洛谷 P14254 分割（divide） 题解"
date: 2025-11-02 09:54:38
tags: ["OI"]
categories: ["OI","题解","洛谷"]
---
## 思路

首先，可以想到如果这 $k$ 个点取的方式没有什么规律的话，会非常难以计算，所以可以猜想这 $k$ 个点分布会有什么规律。

其实不难发现，这 $k$ 个点的深度必须相同，证明：

我们假设 $k$ 个点不都在同一层，那么一定 $\exist i \in (1,k], d_{b_i}>d_{b_1}$，对于 $i$ 这棵树，它的最小深度为 $d_{b_i}$，那么 $d_{b_1} \notin S_i$，所以 $d_{b_1} \notin \bigcap\limits_{i=2}^{k+1} S_i$ 即 $d_{b_1} \notin S_1$，这显然矛盾了，所以得出结论：$k$ 个点必须在同一深度。

对于每一层的点，我们统计答案。令 $mxdep_i$ 表示 $i$ 这个结点的子树在原树中的最大深度，枚举 $d$ 表示深度为 $d$，令 $nums_i$ 表示深度为 $d$ 的所有结点中 $mxdep$ 为 $i$ 的点的数量，很显然，我们在选点的时候只需要关注 $mxdep$ 即可，我们选出的 $k$ 个点中，$1$ 号点的 $mxdep$ 必须最小，证明：

如果 $\exist i \in (1,k], mxdep_i<mxdep_1$，则 $\forall j>mxdep_i, j \notin S_1$，而我们要 $mxdep_1 \in S_1$，这矛盾了，所以 $1$ 号点的 $mxdep$ 必须最小。

枚举当前深度 $d$ 下的每一种 $mxdep$，设当前的 $dep$ 有 $cnt$ 个。如果我们选出在 $cnt$ 个中选出了 $1$ 个，而其他的 $k-1$ 个都 $>dep$，设 $A=\bigcap\limits_{i=2}^{k} S_i$，则 $A$ 的 $\min$ 是大于 $dep$ 的，我们要使得 $A \cap S_{k+1}$ 的 $\min$ 等于 $dep$，则留下的不选的点的 $\max$ 必须恰好为 $dep$。简单来讲，就是 $cnt$ 个如果只选了 $1$ 个，那么剩余的 $k-1$ 个必须恰好覆盖 $>dep$ 的每一个点。

接下来考虑 $cnt$ 个中选出了 $>1$ 个的情况，会发现此时 $\exist i \in (1,k], mxdep_i = dep$，设 $A=\bigcap\limits_{i=2}^{k} S_i$，则 $A$ 的 $\min$ 是等于 $dep$ 的，我们要使得 $A \cap S_{k+1}$ 的 $\min$ 依旧等于 $dep$，则留下的不选的点的 $\max$ 应大于等于 $dep$，即 $\ge dep$ 的所有点不能都选。

按照上述方式统计一下答案即可。

## 代码

```cpp
#define int long long

#define _rep(i,a,b) for (int i=(a);i<=(b);++i)
#define _riter(i,a) for (auto i=a.rbegin();i!=a.rend();++i)

namespace Math {
    const int N=1000005;
    const int mod=998244353;

    int exgcd(int a,int b,int& x,int& y) {
        if (!b) {
            x=1,y=0;
            return a;
        }
        int d=exgcd(b,a%b,y,x);
        y-=a/b*x;
        return d;
    }

    int inverse(int a) {
        int x,y;
        exgcd(a,mod,x,y);
        x=(x%mod+mod)%mod;
        return x;
    }

    int f[N],g[N];

    void init_fact() {
        f[0]=g[0]=1;
        _rep(i,1,N-1) f[i]=f[i-1]*i%mod,g[i]=inverse(f[i]);
    }

    int C(int n,int m) {
        return (f[n]*g[m]%mod)*g[n-m]%mod;
    }

    int A(int n,int m) {
        return f[n]*g[n-m]%mod;
    }
}

namespace Tree {
    const int N=1000005;
    const int M=2000005;
    const int K=1;
    const int mod=998244353;

    int n,m;
    int e[M],ne[M],w[M],h[N],tot;

    void add(int a,int b) {
        e[tot]=b,ne[tot]=h[a],h[a]=tot++;
    }

    void add(int a,int b,int c) {
        e[tot]=b,w[tot]=c,ne[tot]=h[a],h[a]=tot++;
    }
}

using namespace Tree;
using Math::f;
using Math::init_fact;
using Math::A;
using Math::C;

int k,ans;
int dep[N];
int mxdep[N];
vector<int> vec[N];
map<int,int> nums;

void dfs(int u,int fa,int d) {
    dep[u]=mxdep[u]=d;
    vec[d].emplace_back(u);
    _graph(i,u) {
        if (e[i]==fa) continue;
        dfs(e[i],u,d+1);
        mxdep[u]=max(mxdep[u],mxdep[e[i]]);
    }
}

i32 main() {
    // FRR("divide/divide6.in");
    // FRW("divide/my.out");
    memset(h,-1,sizeof(h));
    init_fact();
    read(n),read(k);
    _rep(i,2,n) {
        int p;
        read(p);
        add(p,i),add(i,p);
    }
    dfs(1,0,1);
    // int debug=0;
    _rep(d,2,mxdep[1]) {
        if (vec[d].size()<=k) continue;
        nums.clear();
        _rep(i,0,(int)vec[d].size()-1) nums[mxdep[vec[d][i]]]++;
        int cur=0;
        _riter(it,nums) {
            int dep=it->first,cnt=it->second;
            // cerr<<d<<" "<<dep<<" "<<cnt<<endl;
            // debug=(debug+A(cnt,k))%mod;
            // _assert(cnt==vec[d].size());
            if (cur+cnt<=k) {
                cur+=cnt;
                continue;
            }
            if (cur==k-1 && cnt>1) {
                int res=A(cnt,1)*A(cur,k-1)%mod;
                ans=(ans+res)%mod;
            }
            if (cnt>=2) _rep(i,2,min(cnt,k)) if (cur>=k-i) {
                int res=cnt*C(cnt-1,i-1)%mod;
                res=res*C(cur,k-i)%mod;
                res=res*f[k-1]%mod;
                ans=(ans+res)%mod;
            }
            cur+=cnt;
        }
        // cerr<<"now: "<<d<<" "<<ans<<" "<<debug<<endl;
    }
    // TIMESTAMP
    write(ans);
    return 0;
}
```
