---
title: "洛谷 P13777「o.OI R2」Meowalkane 题解"
date: 2025-08-19
tags: ["洛谷比赛"]
categories: ["OI","题解","洛谷"]
---
## 思路

先忽略掉本质不同这一较为特殊的定义，对于 $n>1$，我们直接枚举 $A_1,A_n$，于是问题转化成了为 $n-2$ 个数字赋予一个 $[0,2]$ 的数字，使得这 $n-2$ 个数字的和为 $k-A_1-A_n$，我们定义 $f(len,k)$ 表示 $len$ 个 $[0,2]$ 的数字之和为 $k$ 的方案数，那么上面我们要求的就是 $\sum\limits_{A_1=0}^{3} \sum\limits_{A_n=0}^{3} [(n-2) \times 2 \ge k-A_1-A_n \wedge k-A_1-A_n \ge 0] f(n-2,k-A_1-A_n)$

然后现在考虑本质不同怎么做，在本题中，相同以及逆序后相同均算作本质相同，所以在上文计数中对称的答案我们计算了一次，其余答案计算了两次，那么我们可以把对称的部分答案再加一次，最后除以二。具体地，如果 $k$ 是偶数，那么 $n$ 必定也为偶数才会出现对称的情况，那么枚举 $A_1=A_n$，答案就是 $f(\frac{n}{2}-1,\frac{k}{2}-A_1)$；如果 $k$ 是奇数，那么我们枚举 $A_1=A_n$ 以及 $A_{\frac{n+1}{2}}$，只有 $k-A_{\frac{n+1}{2}}$ 为偶数时才会出现对称情况，所以答案就是 $f(\frac{n-1}{2}-1,\frac{k-A_{\frac{n+1}{2}}}{2}-A_1)$。

至于如何求 $f(len,k)$，其实不难，我们枚举 $m \in [\lfloor\frac{k+1}{2}\rfloor,\min(k,len)]$，表示在 $len$ 个里面取出了 $m$ 个 $\ge 1$，以及 $len-m$ 个 $0$，那么答案是 $\binom{len}{m}$，当然这还不够，对于这 $m$ 个 $\ge 1$ 的数字，我们先让这 $m$ 个数为 $1$，那么我们还剩下了 $k-m$ 没有放进去，也就是在这 $m$ 个要选出 $k-m$ 个加一，所以就是 $\binom{m}{k-m}$，所以不难得出 $f(len,k) = \sum\limits_{m=\lfloor\frac{k+1}{2}\rfloor}^{\min(k,len)} \binom{m}{k-m} \binom{len}{m}$。

## 代码

```cpp
#define int long long

const int N=1000005;
const int mod=998244353;

int T,n,k;
int f[N],g[N];

int exgcd(int a,int b,int& x,int& y) {
    if (!b) {
        x=1,y=0;
        return a;
    }
    int d=exgcd(b,a%b,y,x);
    y-=a/b*x;
    return d;
}

int inverse(int a) {
    int x,y;
    exgcd(a,mod,x,y);
    x=(x%mod+mod)%mod;
    return x;
}

void init() {
    f[0]=g[0]=1;
    _rep(i,1,N-1) f[i]=f[i-1]*i%mod,g[i]=inverse(f[i]);
}

int C(int n,int m) {
    return (f[n]*g[m]%mod)*g[n-m]%mod;
}

int ksm(int a,int b) {
    if (!b) return 1;
    int k=ksm(a,b>>1);
    if (b&1) return (k*k%mod)*a%mod;
    return k*k%mod;
}

int calc(int len,int k) {
    if (!len && !k) return 1;
//	cout<<"calc: "<<len<<" "<<k<<" = ";
    int ans=0;
    _rep(m,(k+1)/2,min(k,len)) ans=(ans+C(m,k-m)*C(len,m)%mod)%mod;
//	cout<<ans<<endl;
    return ans;
}

i32 main() {
    init();
    read(T);
    while (T--) {
        read(n),read(k);
        if (n==1) puts("1");
        else {
            int ans=0;
            _rep(i,0,3) _rep(j,0,3) {
                int t=k-i-j;
                if ((n-2)*2<t || t<0) continue;
                ans=(ans+calc(n-2,t))%mod;
            }
            if ((k&1)==0) {
                if ((n&1)==0) {
                    _rep(i,0,3) {
                        int t=k/2-i;
                        if ((n/2-1)*2<t || t<0) continue;
                        ans=(ans+calc(n/2-1,t))%mod;
                    }
                }
            }
            if (n&1) {
                _rep(i,0,3) _rep(j,0,2) {
                    if ((k-j)&1) continue;
                    int t=(k-j)/2-i;
                    if (((n-1)/2-1)*2<t || t<0) continue;
                    ans=(ans+calc((n-1)/2-1,t))%mod;
                }
            }
            ans=ans*inverse(2)%mod;
            writeln(ans);
        }
    }
    return 0;
}
```
