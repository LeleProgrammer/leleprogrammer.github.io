---
title: "题解：洛谷 P6041 「ACOI2020」布丁暗杀计划"
date: 2026-05-06 21:46:13
tags: ["OI","启发式合并"]
categories: ["OI","题解","洛谷"]
---
## 思路

离线处理询问，使用倍增，求出询问的 $k$ 级祖先，于是问题就变成了，给定 $u$ 和 $D$，求 $u$ 的子树中，到树根深度为 $D$ 的节点颜色与 $u$ 相同的那些点的 $d$ 之和。这部分复杂度是 $\mathcal{O}(q \log n)$。

每个颜色都是独立开的，所以把每种颜色分开来，重新建立一个森林，每一棵树对应一个颜色，其中父子节点的相对顺序与原图一致。

于是可以使用启发式合并，用一个 map 来维护每个深度的 $\sum d$，从下往上合并的过程中，顺便处理离线下来的询问即可。这部分复杂度是两个 $\mathcal{O}(n \log^2 n)$ 的。

## 代码

这里建立森林的时候，为了防止在 dfs 往上面挂的时候上面没有点可以被挂，所以我给每个颜色都开了一个根节点。

```cpp
const int N=1000005;
const int K=23;

using namespace IO;
using namespace Graph;

int n,q;
int col[N],d[N],dep[N],up[N][K];
int las[N];
map<int,int> mp[N];
int ans[N];
vector<pii> vec;
vector<pii> ask[N]; // (k,id)

inline void dfs(int u,int fa,int d) {
    dep[u]=d;
    int bklas=las[col[u]];
    vec.emplace_back(las[col[u]],u);
    las[col[u]]=u;
    _graph(i,u) {
        if (e[i]==fa) continue;
        up[e[i]][0]=u;
        _rep(j,1,K-1) up[e[i]][j]=up[up[e[i]][j-1]][j-1];
        dfs(e[i],u,d+1);
    }
    las[col[u]]=bklas;
}

inline int find(int u,int k) {
    _rrep(i,K-1,0) if ((1<<i)<=k) {
        u=up[u][i];
        k-=(1<<i);
    }
    return u;
}

inline void combine(int u,int v) {
    if (mp[u].size()<mp[v].size()) swap(mp[u],mp[v]);
    _for(t,mp[v]) mp[u][t.first]+=t.second;
}

inline void solve(int u,int fa) {
    _graph(i,u) {
        if (e[i]==fa) continue;
        solve(e[i],u);
        combine(u,e[i]);
    }
    mp[u][dep[u]]+=d[u];
    _for(t,ask[u]) ans[t.second]=mp[u][dep[u]+t.first];
}

i32 main() {
    Graph::init_graph();
    read(n,q);
    _rep(i,1,n) read(col[i]);
    _rep(i,1,n) read(d[i]);
    _rep(i,2,n) {
        int fa;
        read(fa);
        add(fa,i),add(i,fa);
    }
    _rep(i,1,500000) las[i]=n+i;
    dfs(1,0,1);
    Graph::restore_graph();
    _for(t,vec) add(t.first,t.second),add(t.second,t.first);
    _rep(i,1,q) {
        int u,k;
        read(u,k);
        int anc=find(u,k);
        if (!anc) continue;
        ask[anc].emplace_back(pii{k,i});
    }
    _rep(i,1,500000) solve(n+i,0);
    _rep(i,1,q) writeln(ans[i]);
    return 0;
}
```
