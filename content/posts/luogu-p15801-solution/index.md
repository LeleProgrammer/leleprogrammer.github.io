---
title: "题解：洛谷 P15801 [GESP202603 六级] 完全二叉树"
date: 2026-03-16 20:05:38
tags: ["OI","分类讨论","GESP"]
categories: ["OI","题解","洛谷"]
---
## 思路

记 $mxdep_u$ 为点 $u$ 为子树的最大深度，$dep_u$ 表示点 $u$ 深度，$flag_u$ 表示是否为完全二叉树，$full_u$ 表示是否为满二叉树。

对每个点分类讨论。

- 如果没有左右儿子，则 $full_u=1,flag_u=1$。
- 如果只有右儿子，则 $full_u=0,flag_u=0$。
- 如果只有左儿子，则 $full_u=0$，如果 $full_{l_u}$ 且 $mxdep_{l_u}=dep_u+1$ 则 $flag_u=1$ 否则为 $0$。
- 如果左右儿子都有：
- - 如果两者子树的最大深度都相等：
  - - 如果左右都满，则 $full_u=1,flag_u=1$。
    - 如果左满右完全，则 $full_u=0,flag_u=1$。
    - 否则 $full_u=0,flag_u=0$。
  - 如果左子树的最大深度比右子树的最大深度大 $1$：
  - - 如果左右都满，则 $full_u=0,flag_u=1$。
    - 如果左完全右满，则 $full_u=0,flag_u=1$。
    - 否则 $full_u=0,flag_u=0$。
  - 否则 $full_u=0,flag_u=0$。

最后求 $flag_u=1$ 的 $u$ 的数量即可。

## 代码

```cpp
int n;
int l[N],r[N];
int mxdep[N],dep[N];
bool flag[N],full[N];

inline void dfs(int u,int d) {
    if (!u) return;
    dep[u]=d;
    dfs(l[u],d+1),dfs(r[u],d+1);
    mxdep[u]=max3(d,mxdep[l[u]],mxdep[r[u]]);
    if (!l[u] && !r[u]) full[u]=1,flag[u]=1;
    else if (!l[u] && r[u]) full[u]=0,flag[u]=0;
    else if (l[u] && !r[u]) full[u]=0,flag[u]=(full[l[u]] && mxdep[l[u]]==dep[u]+1);
    else {
        if (mxdep[l[u]]==mxdep[r[u]]) {
            if (full[l[u]] && full[r[u]]) full[u]=1,flag[u]=1;
            else if (full[l[u]] && flag[r[u]]) full[u]=0,flag[u]=1;
            else full[u]=0,flag[u]=0;
        } else if (mxdep[l[u]]==mxdep[r[u]]+1) {
            if (full[l[u]] && full[r[u]]) flag[u]=1,full[u]=0;
            else if (flag[l[u]] && full[r[u]]) flag[u]=1,full[u]=0;
            else flag[u]=0,full[u]=0;
        } else flag[u]=0,full[u]=0;
    }
}

int main() {
    read(n);
    _rep(i,1,n) read(l[i],r[i]);
    dfs(1,1);
    int ans=0;
    _rep(i,1,n) ans+=flag[i];
    write(ans);
    return 0;
}
```
