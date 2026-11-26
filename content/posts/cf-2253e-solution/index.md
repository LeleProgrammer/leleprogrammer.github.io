---
title: "题解：CF2253E Diameter Intersections"
date: 2026-08-10 15:28:26
tags: ["OI"]
categories: ["OI","题解","Codeforces"]
---
比赛最后 $50$ 秒过的。

## 思路

结论：选定一条直径 $d$，其余的所有直径 $d_1,d_2,d_3,\cdots$ 都会与 $d$ 相交，且边的交集一定包含最中间的那条边。

证明如下：

首先题目保证树的直径经过的边数为奇数，那么存在“最中间的边”。

接下来考虑反证法，若存在一条直径 $d_i$ 与 $d$ 的交不为最中间的边，那么我们选择其点集的交的其中一个点 $u$，点 $u$ 将直径 $d$ 分为长度为 $a,b$ 两部分，将直径 $d_i$ 分为长度为 $p,q$ 两部分。

为了满足直径的定义，显然有 $a+b=p+q$，由于我们假设两条直径不交在最中间的边，那么有 $a \neq b, p \neq q$，不妨设 $a<b,p<q$，则我们可以在树中选出一条更长的链，长度为 $b+p$，与前文矛盾，因此结论得证。

接下来求答案，我们从最中间这条边两端的点，向外延申。如果一个点 $u$ 往其延申方向走，能够延申出 $\ge 2$ 条链，这两条链都能达到直径在该侧的长度，那么这个点 $u$ 可以作为两条相交直径的分叉点之一。我们记录两端延申出去能够延申的每一个长度，然后枚举两边的长度合并即可。

有点抽象？这里举一个例子：

![](https://cdn.luogu.com.cn/upload/image_hosting/f65y99ta.png)

蓝色圆圈标记的边就是我们取出来的初始直径，黄色三角形是正中间的边，绿色的钩表示可以成为直径分叉点的节点。深度与直径端点相同的点也是可以的算进去的，因为允许两条直径完全重合。

把黄色的边分给左边，去重后，可得 $S=\{1,2,3\}$，右边同理 $T=\{0,1,2\}$，合并后就有 $\{1,2,3,4,5\}$ 这 $5$ 种结果。

暴力合并两个集合为什么是正确的？

因为我们有进行去重操作（去重随便怎么做都行，可以拿 `set` 维护，也可以拿一个 `vector` 排序完 `unique` 一下），那么为了卡满，让集合产生数字 $1$ 需要 $1$ 个新节点，产生数字 $2$ 需要 $2$ 个新节点，产生数字 $i$ 需要 $i$ 个新节点，不难发现集合大小是 $\sqrt{n}$ 级别的，平方完就是 $\mathcal{O}(n)$，可行。

## 代码

由于赛时时间不多了，所以写的比较杂乱，这里提供的代码不含火车头，需要完整代码的可以查看[这个](https://codeforces.com/contest/2253/submission/386128292)。

```cpp
using namespace IO;
using namespace Graph;
 
int T,n,len;
int dep[N];
int fa[N],nex[N],faa[N];
int mxdep[N];
int root,g,mid;
 
inline void dfs(int u,int p,int d) {
    dep[u]=d,fa[u]=p;
    _graph(i,u) {
        if (e[i]==p) continue;
        dfs(e[i],u,d+1);
    }
}
 
inline void dfs2(int u) {
    mxdep[u]=dep[u];
    _graph(i,u) {
        if (e[i]==fa[u]) continue;
        dfs2(e[i]);
        chmax(mxdep[u],mxdep[e[i]]);
    }
}
 
inline void dfs3(int u,set<int>& ans) {
    int cnt=0;
    _graph(i,u) {
        if (e[i]==fa[u]) continue;
        dfs3(e[i],ans);
        if (mxdep[e[i]]==dep[g]) cnt++;
    }
    if (cnt>=2) ans.emplace(dep[u]-dep[mid]);
}
 
inline void dfs4(int u,set<int>& ans) {
    int cnt=0;
    _graph(i,u) {
        if (e[i]==fa[u]) continue;
        if (e[i]==nex[u]) continue;
        if (e[i]==faa[u]) continue;
        dfs4(e[i],ans);
        if (mxdep[e[i]]==dep[root]) cnt++;
    }
    if (nex[faa[u]]==u) cnt++;
    // cout<<"dfs4: "<<u<<" "<<cnt<<endl;
    if (cnt>=2) ans.emplace(dep[u]-dep[mid]);
    if (nex[faa[u]]==u) dfs4(faa[u],ans);
}
 
int main() {
    Graph::init_graph();
    read(T);
    while (T--) {
        read(n);
        Graph::restore_graph(n);
        _rep(i,1,n-1) {
            int a,b;
            read(a,b);
            add(a,b);
            add(b,a);
        }
        dfs(1,0,1);
        root=1;
        _rep(i,2,n) if (dep[i]>dep[root]) root=i;
        dfs(root,0,1);
        g=1;
        _rep(i,2,n) if (dep[i]>dep[g]) g=i;
        _rep(i,1,n) nex[i]=0;
        int cur=g;
        vector<int> vec; // g -> root
        while (fa[cur]) vec.emplace_back(cur),nex[fa[cur]]=cur,cur=fa[cur];
        vec.emplace_back(root);
        dfs2(root);
        len=dep[g]-dep[root];
        int l=(int)vec.size()/2-1;
        mid=vec[l+1];
        set<int> down;
        dfs3(mid,down);
        _rep(i,1,n) faa[i]=fa[i];
        dfs(mid,0,1);
        dfs2(mid);
        set<int> up;
        dfs4(mid,up);
        up.emplace(len>>1);
        down.emplace((len>>1)+1);
        // cout<<"frto: "<<root<<" "<<g<<endl;
        // cout<<"mid: "<<mid<<endl;
        // cout<<"down: "; _for(t,down) cout<<t<<" "; cout<<endl;
        // cout<<"up: "; _for(t,up) cout<<t<<" "; cout<<endl;
        set<int> ans;
        _for(t,up) _for(q,down) ans.emplace(t+q);
        writesp(ans.size());
        _for(t,ans) writesp(t);
        putchar(10);
    }
    return 0;
}
 
/*
root
|
mid --- ...
|
l --- ...
|
g
*/
```
