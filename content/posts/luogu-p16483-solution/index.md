---
title: "题解：P16483 [GKS 2014 #B] New Years Eve"
date: 2026-08-11
tags: ["OI","Google Kick Start"]
categories: ["OI","题解","洛谷"]
---
## 思路

一层，形如：

```plaintext
   1
  2 3
 4 5 6
7 8 9 10
...
```

每个杯子会流向下方的三个杯子，第 $i$ 个杯子正下方偏上的一个是 $i$，偏左下的一个分别为：

```plaintext
    2
   4  5
  7 8   9
11 12 13 14
...
```

同一层（高度）内，我们还可以分成若干小层，每一个小层的杯子数量分别为 $1,2,3,4,\cdots$，第 $i$ 个杯子所在的小层有 $j$ 个杯子，那么其下方偏左下的杯子的编号即为 $i+j$。

现在，转移方向已经确定了，最后就是把递推模拟一下即可。

那有人就会问了，总共 $N$ 层，每层的杯子数量是 $L^2$ 级别，有 $T$ 组数据，那不是 $\mathcal{O}(TL^3)$ 吗？其实这里用到 $B \le 50000$ 这个限制，由于一罐酒可以填满 $3$ 个杯子，因此最多 $1.5 \times 10^5$ 个杯子会满，我们可以加上一个判断，如果还没到第 $L$ 层，某一层的杯子全都空了，就直接退出，加上去后跑得飞快。

## 代码

```cpp
int T,b,l,n;
double f[2][N];

int main() {
    read(T);
    _rep(tt,1,T) {
        read(b,l,n);
        memset(f,0,sizeof(f));
        int cur=0,nex=1;
        f[cur][1]=b*750;
        bool ok=true;
        _rep(i,1,l-1) {
            memset(f[nex],0,sizeof(f[nex]));
            bool none=true;
            int len=1,st=0;
            _rep(j,1,i*(i+1)/2) {
                double rem=f[cur][j]-250;
                if (rem>0) {
                    f[cur][j]=250;
                    none=false;
                    f[nex][j]+=rem/3.0;
                    f[nex][j+len]+=rem/3.0;
                    f[nex][j+len+1]+=rem/3.0;
                }
                if (j==st+len) len++,st=j;
            }
            if (none) {
                ok=false;
                break;
            }
            swap(cur,nex);
        }
        printf("Case #%d: ",tt);
        if (!ok) puts("0.000000000000");
        else printf("%.12lf\n",min(250.0,f[cur][n]));
    }
    return 0;
}
```
