---
title: "洛谷 P13271 [NOI2025] 机器人 题解"
date: 2025-08-17 23:39:35
tags: ["NOI"]
categories: ["OI","题解","洛谷"]
---
一道比较不错的分层图题目，记录一下。

## 思路

对于一个点 $i$，假设它的出度为 $outdeg_i$，那么建立 $outdeg_i + 1$ 个点，对于一条边，如果这条边是 $i$ 的第 $j$ 条边，那么 $i$ 的第 $j$ 个点连到终点 $dest$ 的第 $j$ 个点，如果这个点不存在，那么就连接到 $j$ 的第 $outdeg_{dest}$ 个点同时加上 $p$ 下降的这部分值，用前缀和求出 $w$ 的一段的和，同时 $i$ 的第 $j$ 个点向 $dest$ 的第 $outdeg_{dest}+1$ 个点连边。对于一个点的前 $outdeg_{dest}$ 个点，相邻两点按照 $v,w$ 连边。

点的编号可以按照如下方式排列，$(1,1),(1,2),\cdots,(1,outdeg_{1}+1),(2,1),\cdots,(n,outdeg_{n}+1)$，从 $(1,1)$ 开始跑 dijkstra，对于每个点，在它附属的下面的点里面找到最小的一个输出即可。

## 代码

```cpp
#define int long ong

const int N=1000005;
const int M=2000005;
const int inf=1e18;

int c,n,m,k;
int in[N],de[N];
int pre[N];
int outdeg[N];
int pod[N];
vector<pii> vec[N];
int e[M],ne[M],w[M],h[N],tot;
int dis[N];
bool flag[N];
priority_queue<pii,vector<pii>,greater<pii>> q;

int get(int u,int k) {
    return pod[u-1]+k;
}

void add(int a,int b,int c) {
    e[tot]=b,w[tot]=c,ne[tot]=h[a],h[a]=tot++;
}

void dijkstra() {
    _rep(i,1,N-1) dis[i]=inf;
    q.emplace(pii{dis[get(1,1)]=0,get(1,1)});
    while (!q.empty()) {
        auto tp=q.top(); q.pop();
        int u=tp.second;
        if (flag[u]) continue;
        flag[u]=true;
        _graph(i,u) if (dis[e[i]]>dis[u]+w[i]) q.emplace(pii{dis[e[i]]=dis[u]+w[i],e[i]});
    }
}

i32 main() {
    memset(h,-1,sizeof(h));
    read(c),read(n),read(m),read(k);
    _rep(i,1,k-1) read(in[i]);
    _rep(i,2,k) read(de[i]);
    _rep(i,2,k) pre[i]=pre[i-1]+de[i];
    _rep(i,1,n) {
        int d;
        read(d);
        outdeg[i]=d;
        while (d--) {
            int y,z;
            read(y),read(z);
            vec[i].emplace_back(pii{y,z});
        }
    }
    _rep(i,1,n) pod[i]=pod[i-1]+outdeg[i]+1;
    _rep(i,1,n) {
        _rep(j,0,(int)vec[i].size()-1) {
            int t=min(j+1,outdeg[vec[i][j].first]);
            if (t) add(get(i,j+1),get(vec[i][j].first,t),vec[i][j].second+pre[j+1]-pre[t]);
            add(get(i,j+1),get(vec[i][j].first,outdeg[vec[i][j].first]+1),vec[i][j].second);
        }
        _rep(j,1,outdeg[i]-1) {
            add(get(i,j),get(i,j+1),in[j]);
            add(get(i,j+1),get(i,j),de[j+1]);
        }
    }
    dijkstra();
    _rep(i,1,n) {
        int ans=inf;
        _rep(j,1,outdeg[i]+1) ans=min(ans,dis[get(i,j)]);
        if (ans==inf) writesp(-1);
        else writesp(ans);
    }
    return 0;
}
```
