---
title: "题解：洛谷 P15804 [GESP202603 八级] 消息查找"
date: 2026-03-16 14:21:20
tags: ["OI","GESP","最短路","图论"]
categories: ["OI","题解","洛谷"]
---
## 思路

注意到引用消息不超过 $1000$，那么我们把引用了消息的消息、被引用了的消息取出来，就有 $2000$ 个关键点。

对于取出的这些关键点，第 $i$ 个点连到第 $i-1$ 个点，权值为两者 $r$ 之差，对于每一对引用关系，$i$ 连到 $r_i$，权值为 $1$。

对于每次查询 $x$ 走到 $y$，我们二分找到第一个 $\ge y$ 的关键点 $y'$，以及最后一个 $\le x$ 的关键点 $x'$，$x \rightarrow x', y' \rightarrow y$ 这两段直接一格一格走，再加上 $x' \rightarrow y'$ 的最短路即可。由于只有 $2000$ 个点，全源最短路直接跑 dijkstra 复杂度是可行的。

时间复杂度 $\mathcal{O}(K^2 \log K + Q \log K)$，其中 $K$ 是关键点数量。

## 代码

省去了大量火车头，不能直接运行但是你能看得懂。

```cpp
int n,m,idx;
int r[N];
bool g[N];
int ind[N];
set<int> st;
int dis[K][K];
bool flag[K];
priority_queue<pii,vector<pii>,greater<pii>> q;

inline void dijkstra(int s) {
    memset(dis[s],0x3f,sizeof(dis[s]));
    memset(flag,0,sizeof(flag));
    q.emplace(pii{dis[s][s]=0,s});
    while (!q.empty()) {
        auto tp=q.top(); q.pop();
        int u=tp.second;
        if (flag[u]) continue;
        flag[u]=true;
        _graph(i,u) if (dis[s][e[i]]>dis[s][u]+w[i] && !flag[e[i]]) q.emplace(pii{dis[s][e[i]]=dis[s][u]+w[i],e[i]});
    }
}

int main() {
    Graph::init_graph();
    read(n,m);
    _rep(i,1,n) {
        read(r[i]);
        if (r[i]) g[i]=g[r[i]]=true;
    }
    _rep(i,1,n) if (g[i]) st.emplace(i),ind[i]=++idx;
    st.emplace(n+1);
    int las=0;
    _rep(i,1,n) if (g[i]) {
        if (las) add(ind[i],ind[las],i-las);
        if (r[i]) add(ind[i],ind[r[i]],1);
        las=i;
    }
    _rep(i,1,n) if (g[i]) dijkstra(ind[i]);
    while (m--) {
        int x,y;
        read(x,y);
        if (*(st.lower_bound(x))==*(st.lower_bound(y))) {
            writeln(x-y);
            continue;
        }
        int nex=*(st.lower_bound(y));
        int pre=*prev(st.upper_bound(x));
        writeln(nex-y+x-pre+dis[ind[pre]][ind[nex]]);
    }
    return 0;
}
```
