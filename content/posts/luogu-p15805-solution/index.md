---
title: "题解：洛谷 P15805 [GESP202603 八级] 子图最短路"
date: 2026-03-16
tags: ["OI","图论","最短路","GESP"]
categories: ["OI","题解","洛谷"]
---
## 思路

看到 $n \le 100$，~~考虑乱搞~~。

选择判断题里面有一道启发了我们：用 dijkstra 跑完一张图的最短路，再用 floyd 跑一遍，不会影响答案正确性。

所以我们先枚举 $l$，清空当前图 $g$，枚举 $r$，每当 $r$ 前进一位的时候，我们将与 $r$ 有关的边加入当前图中，以 $r$ 为起点跑一遍 dijkstra，于是我们处理出了 $r$ 到每一个点的距离 $dis$，然后枚举 $i,j$，$g_{i,j} \leftarrow \min(g_{i,j},dis_i+dis_j)$，不难发现这一步就是 floyd 的松弛操作，每次处理完 $g_{i,j}$，计入答案即可。

发现模数是 $10^9$，所以代码中令正无穷的值为 $10^9$，这样一来，两点不连通的时候加入答案，其实并没有什么影响。

枚举左右端点都是 $\mathcal{O}(n^2)$ 的，dijkstra 边数最大可达 $n^2$ 级别，所以 dijkstra 复杂度最坏为 $\mathcal{O(n^2 \log n)}$，计入答案部分是 $\mathcal{O(n^2)}$，所以取最大的一项，理论最坏复杂度是 $\mathcal{O(n^4 \log n)}$，但是由于 dijkstra 的边是动态增加的，而且对于每一个 $l$ 来说，$r,i,j$ 都可以不用跑满整个 $[1,n]$ 的，所以实际运行会挺快。

## 代码

由于我的代码包含过多火车头，所以这里只提供关键部分，反正应该能看懂，但是你抄不走。

```cpp
#define _rep(i,a,b) for (int i=(a);i<=(b);++i)
#define _graph(i,u) for (int i=h[u];~i;i=ne[i])
typedef pair<int,int> pii;

using namespace IO;
using namespace Graph;

int n,m,ans;
int G[N][N];
int g[N][N];
int dis[N];
bool flag[N];
priority_queue<pii,vector<pii>,greater<pii>> q;

inline void dijkstra(int s) {
    _rep(i,1,n) dis[i]=mod,flag[i]=0;
    q.emplace(pii{dis[s]=0,s});
    while (!q.empty()) {
        auto tp=q.top(); q.pop();
        int u=tp.second;
        if (flag[u]) continue;
        flag[u]=true;
        _graph(i,u) if (dis[e[i]]>dis[u]+w[i] && !flag[e[i]]) q.emplace(pii{dis[e[i]]=dis[u]+w[i],e[i]});
    }
}

int main() {
    Graph::init_graph();
    read(n,m);
    _rep(i,1,n) _rep(j,1,n) G[i][j]=mod;
    _rep(i,1,n) G[i][i]=0;
    while (m--) {
        int a,b,c;
        read(a,b,c);
        G[a][b]=G[b][a]=min(G[a][b],c);
    }
    _rep(l,1,n) {
        _rep(i,1,n) _rep(j,1,n) g[i][j]=mod;
        _rep(r,l,n) {
            if (l==r) Graph::restore_graph(n);
            _rep(t,l,r) if (G[r][t]!=inf) add(r,t,G[r][t]),add(t,r,G[r][t]);
            dijkstra(r);
            _rep(i,l,r) _rep(j,l,r) {
                chmin(g[i][j],dis[i]+dis[j]);
                if (i<j) ans=(ans+g[i][j])%mod;
            }
        }
    }
    write(ans);
    return 0;
}
```
