---
title: "洛谷 P13872 [蓝桥杯 2024 省 Java/Python A] 砍柴 题解"
date: 2025-08-29
tags: ["蓝桥杯","OI"]
categories: ["OI","题解","洛谷"]
---
## 思路

一方拿到了 $x$ 这个数字后必定失败，则称 $x$ 为该方的必败点，如果必定胜利，则称为必胜点。

会发现 $x=0$ 或 $x=1$ 时就是必败点，每一次进行操作的时候会减去质数，那么必败点加上一个质数，得到的点就是另一方的必胜点，因为对方可以通过减掉这个质数使该方进入必败状态，所以，设 $f_i$ 表示长度为 $i$ 时小蓝必胜还是必败，若存在一个质数 $p \le i$ 使得 $f_{i-p}$ 为必败，则 $f_i=1$ 即必胜，否则必败。

筛一遍质数，然后跑一边动态规划即可。

## 代码

```cpp
const int N=100005;

int T,n;
int pri[N],idx;
bool flag[N];
bool f[N];

void init() {
	_rep(i,2,N-1) {
		if (!flag[i]) pri[++idx]=i;
		_rep(j,1,idx) {
			if (i*pri[j]>=N) break;
			flag[i*pri[j]]=true;
			if (i%pri[j]==0) break;
		}
	}
}

void solve() {
	_rep(i,2,N-1) {
		_rep(j,1,idx) {
			if (pri[j]>i) break;
			f[i]|=(f[i-pri[j]]^1);
		}
	}
}

int main() {
	init();
	solve();
	read(T);
	while (T--) {
		read(n);
		if (f[n]) writeln(1);
		else writeln(0);
	}
	return 0;
}
```
