---
title: "洛谷 P13871 [蓝桥杯 2024 省 Java/Python A] 吊坠 题解"
date: 2025-08-29 18:27:49
tags: ["蓝桥杯","OI"]
categories: ["OI","题解","洛谷"]
---
## 思路

动态规划、最小生成树。

首先利用动态规划来求任意两个串的最长公共子串数量，设 $f_{p,q}$ 表示公共子串结束于串 $s_i$ 的第 $p$ 个字符，以及串 $s_j$ 的第 $q$ 个字符，那么可以写出转移方程如下：$f_{p,q} = [s_{i,p}=s_{j,q}] \times (f_{p-1,q-1}+1)$，然后 $res$ 取 $f$ 中所有数的 $\max$，由于串可以滚动，所以复制一份接在后面，求得的 $res$ 和 $m$ 取个 $\min$ 即可。

于是我们构造出了不到 $4 \times 10^4$ 条边，然后对这些边的边权排个序，做 Kruskal 即可。

## 代码

```cpp
const int N=205;
const int M=105;
const int K=39805;

int n,m,idx;
char s[N][M];
int f[M][M];
int p[N];

struct edge {
	int a,b,c;
	friend bool operator < (const edge& a,const edge& b) {
		return a.c>b.c;
	}
} arr[K];

int find(int x) {
	return (p[x]==x)?p[x]:(p[x]=find(p[x]));
}

int main() {
	read(n),read(m);
	_rep(i,1,n) {
		readstr(s[i]+1);
		_rep(j,1,m) s[i][j+m]=s[i][j];
	}
	_rep(i,1,n-1) _rep(j,i+1,n) {
		memset(f,0,sizeof(f));
		int res=0;
		_rep(p,1,m<<1) _rep(q,1,m<<1) {
			if (s[i][p]==s[j][q]) f[p][q]=f[p-1][q-1]+1,res=max(res,f[p][q]);
		}
		arr[++idx]={i,j,min(res,m)};
	}
	sort(arr+1,arr+1+idx);
	_rep(i,1,n) p[i]=i;
	int ans=0;
	_rep(i,1,idx) {
		int a=arr[i].a,b=arr[i].b,c=arr[i].c;
		if (find(a)==find(b)) continue;
		p[find(a)]=find(b);
		ans+=c;
	}
	write(ans);
	return 0;
}
```
