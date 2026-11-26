---
title: "题解：CF2253C Sum of Distinct Values in a Matrix"
date: 2026-08-10 17:14:53
tags: ["OI"]
categories: ["OI","题解","Codeforces"]
---
这题思路很容易想到，但是实现方式需要琢磨琢磨，赛时卡了一段时间。

## 思路

假设现在我们在某一行填了一个数字，那么这个数字会出现 $m$ 次，又因为重复的数字只算一次，那么我们可以选定 $m-1$ 个列进行填数。行列转换一下也是同理。

将行和列出现的那些数字放在一起排序，并标明每个数字属于行还是列，然后降序枚举，能填就填。

但是，由于行列会出现重复的数字，重复的我们只保留一个，这样就会带来一个问题：重复的时候应该填给行还是填给列？

我们开一个变量 $d$，记录重复的数字个数，当 $n+m-d-1>0$ 时可以填数。

具体地，考虑以下过程：

将只属于行的数 $k$ 记为 $(k,0)$，只属于列的数 $k$ 记为 $(k,1)$，行列交集记为 $(k,2)$，然后按照 $k$ 的大小，降序排序。

枚举每一个二元组 $(k,p)$，如果 $n-m-d-1 \le 0$ 则退出，否则，若 $p=2$，则 $d \leftarrow d+1, ans \leftarrow ans+k$，若 $p=0 \land n>0$，则 $n \leftarrow n-1, ans \leftarrow ans+k$，若 $p=1 \land m>0$，则 $m \leftarrow m-1, ans \leftarrow ans+k$。

最后输出 $k$ 即可。

## 代码

省去火车头，核心代码如下：

```cpp
using namespace IO;

int T,n,m,x,y;
int a[N],b[N];

i32 main() {
    read(T);
    while (T--) {
        read(n,m,x,y);
        _rep(i,1,x) read(a[i]);
        _rep(i,1,y) read(b[i]);
        set<int> sa;
        _rep(i,1,x) sa.emplace(a[i]);
        set<int> st;
        _rep(i,1,y) if (sa.count(b[i])) st.emplace(b[i]);
        map<int,int> mp;
        _rep(i,1,x) {
            if (st.count(a[i])) mp[a[i]]=2;
            else mp[a[i]]=0;
        }
        _rep(i,1,y) if (!st.count(b[i])) mp[b[i]]=1;
        int d=0,ans=0;
        while (!mp.empty()) {
            if (n+m-d-1<=0) break;
            auto t=prev(mp.end());
            int num=t->first,tp=t->second;
            mp.erase(t);
            if (tp==2) {
                d++;
                ans+=num;
            } else if (tp==0) {
                if (n) n--,ans+=num;
            } else {
                if (m) m--,ans+=num;
            }
        }
        writeln(ans);
    }
    return 0;
}
```

[完整代码](https://codeforces.com/contest/2253/submission/386107868)
