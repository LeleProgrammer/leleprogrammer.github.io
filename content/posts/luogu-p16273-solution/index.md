---
title: "题解：洛谷 P16273 [蓝桥杯 2026 省 Java B 组] 回程"
date: 2026-04-12 21:09:25
tags: ["OI","蓝桥杯","图论"]
categories: ["OI","题解","洛谷"]
---
简单图论题。

## 思路

分层图，共 $5$ 层，第 $1$ 层表示还未经过特殊点，第 $2$ 层表示经过了特殊点并且使用了 $0$ 次机会，第 $3$ 层表示使用了 $1$ 次，依此类推。

用 $u+ni$ 表示第 $i+1$ 层图的第 $u$ 个点，那么对于输入的 $u,v,w$，我们可以按如下方式连边：

- $u+ni \longleftrightarrow v+ni$，边权为 $w$，且 $0 \le i \le 4$。
- $u+ni \longrightarrow v+n(i+1), v+ni \longrightarrow u+n(i+1)$，边权为 $1$，且 $1 \le i \le 3$。

对于给定的 $x$，连边：$x \longrightarrow x+n$，边权为 $0$。

dijkstra 跑一下，这道题就做完了。

## 代码

```cpp
i32 main() {
    Graph::init_graph();
    SP::init();
    read(n,m,x);
    add(x,x+n,0);
    while (m--) {
        int u,v,w;
        read(u,v,w);
        _rep(i,0,4) add(u+n*i,v+n*i,w),add(v+n*i,u+n*i,w);
        _rep(i,1,3) {
            add(u+n*i,v+n*(i+1),1);
            add(v+n*i,u+n*(i+1),1);
        }
    }
    dijkstra(n);
    int ans=inf;
    _rep(i,0,4) chmin(ans,dis[1+n*i]);
    if (ans==inf) ans=-1;
    write(ans);
    return 0;
}
```
