---
title: "题解：洛谷 P8188 [USACO22FEB] Email Filing S"
date: 2026-03-11
tags: ["OI","USACO","模拟"]
categories: ["OI","题解","洛谷"]
---
**这里给一个时间复杂度严格线性的做法。**

## 思路

邮件可能存在“向上滚动”行为，即最后 $K$ 个邮件，每匹配掉一个，前面没匹配过的就会进来一个。

但是文件夹是不具备“向上滚动”的行为的，这一点是显然的。

因此，当我们将文件夹的滑动窗口从 $[l,r]$ 滚动到 $[l+1,r+1]$ 时，必须保证 $f_i = l$ 的每一个 $i$ 都已经被匹配过了。

所以我们令 `cnt[i]` 表示需要放到第 $i$ 个文件夹的邮件还剩下多少个，当且仅当 `!cnt[l] && r!=m` 的时候我们可以向后推动文件夹窗口。

我们建立一个栈 `stk`，一个双端队列 `cur` 以及一个队列 `rem`。`rem` 表示在当前窗口之后的邮件，`cur` 表示当前窗口内的邮件，`stk` 表示在窗口前面的邮件。

初始的时候，我们将每一个 $f_i$ 放到 `rem` 里面，接下来，只要 `rem` 不为空，我们就检查队头的元素能否直接被匹配，此时如果 `cur` 的元素数量达到了 `k`，那么我们就需要将 `cur` 的最左边的元素放到 `stk` 里，表示我们将邮件窗口向右移动，以腾出一个位置。腾出了这个位置之后呢，我们取出 `rem` 最左边的元素，如果它在文件夹窗口内，那么直接丢掉不管了，否则放到 `cur` 里面。

但是这样就有一个问题，当文件夹窗口向右滑动，有可能一部分 `cur` 里面的数就能被匹配，但是我们不可能从队列中间取出一个数扔掉，所以我们再开一个 `curr[i]` 表示当前在 `cur` 队列里的 $i$ 有多少个，再开一个 `dec` 表示 `cur` 中有多少个数是可以被直接去掉的，那么每次 `r++` 的时候，我们就让 `dec+=curr[r]`，然后判断队列是否已经达到 $k$ 个元素就可以这么写 `cur.size()-dec==k`。

所以在将 `rem` 清空的过程中，我们这么写：

```cpp
int l=1,r=k,dec=0;
while (!cnt[l] && r!=m) l++,r++,dec+=curr[r];
_rep(i,1,n) rem.emplace(arr[i]);
while (!rem.empty()) {
    while (cur.size()-dec==k) {
        int v=cur.front(); cur.pop_front();
        if (v>r) stk.emplace(v),curr[v]--; // 如果取出来的数字在文件夹窗口之外，那么它无法被匹配，放到 stk 里
        else dec--,curr[v]--;
    }
    int u=rem.front(); rem.pop();
    if (u>=l && u<=r) cnt[u]--; // 如果在窗口内，直接匹配掉
    else cur.emplace_back(u),curr[u]++; // 否则放到 cur 里面
    while (!cnt[l] && r!=m) l++,r++,dec+=curr[r],cnt[r]-=curr[r]; // 尝试将邮件窗口移动，移动后有 curr[r] 个元素在 cur 中直接被匹配掉，于是 cnt 也要减掉 curr[r]
}
```

接下来我们要考虑回滚操作，因为我们刚刚会把一些东西放到 `stk` 里面，现在我们尝试消去 `stk` 里面的数，不难发现，这个操作与前文是同理的，只不过，当 `cur` 元素数量达到 $k$ 时，直接就判定无解，因为取出来的数没地方放了，没办法腾出位置来，其余操作一样，只不过我们刚刚是在 `cur` 的尾部加入元素，现在改成在头部加入即可。

```cpp
bool ok=true;
while (!stk.empty()) {
    if (cur.size()-dec==k) {
        ok=false;
        break;
    }
    int u=stk.top(); stk.pop();
    if (u>=l && u<=r) cnt[u]--;
    else cur.emplace_front(u),curr[u]++;
    while (!cnt[l] && r!=m) l++,r++,dec+=curr[r],cnt[r]-=curr[r];
}
```

于是这道题就做完了，每个元素顶多被 `stk,cur,rem` 分别推入与弹出一次，所以时间复杂度是严格线性的。

## 代码

```cpp
int T,m,n,k;
int arr[N];
int cnt[N];
int curr[N];

int main() {
    read(T);
    while (T--) {
        memset(cnt,0,sizeof(cnt));
        memset(curr,0,sizeof(curr));
        read(m,n,k);
        _rep(i,1,n) read(arr[i]),cnt[arr[i]]++;
        stack<int> stk;
        queue<int> rem;
        deque<int> cur;
        int l=1,r=k,dec=0;
        while (!cnt[l] && r!=m) l++,r++,dec+=curr[r];
        _rep(i,1,n) rem.emplace(arr[i]);
        while (!rem.empty()) {
            while (cur.size()-dec==k) {
                int v=cur.front(); cur.pop_front();
                if (v>r) stk.emplace(v),curr[v]--;
                else dec--,curr[v]--;
            }
            int u=rem.front(); rem.pop();
            if (u>=l && u<=r) cnt[u]--;
            else cur.emplace_back(u),curr[u]++;
            while (!cnt[l] && r!=m) l++,r++,dec+=curr[r],cnt[r]-=curr[r];
        }
        bool ok=true;
        while (!stk.empty()) {
            if (cur.size()-dec==k) {
                ok=false;
                break;
            }
            int u=stk.top(); stk.pop();
            if (u>=l && u<=r) cnt[u]--;
            else cur.emplace_front(u),curr[u]++;
            while (!cnt[l] && r!=m) l++,r++,dec+=curr[r],cnt[r]-=curr[r];
        }
        if (ok) puts("YES");
        else puts("NO");
    }
    return 0;
}
```
