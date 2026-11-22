---
title: "洛谷 P14255 列车（train） 题解"
date: 2025-11-02
tags: ["OI"]
categories: ["OI","题解","洛谷"]
---
## 思路

记 $ep_i$ 表示第 $i$ 站作为起点站时第一个可行的终点站的下标，$p_i$ 表示第 $i$ 站的位置，$dis_i$ 表示从 $i$ 这个起点站开始走到它的第一个终点站的距离。

上面几个东西非常容易求，于是考虑将这个东西推广到区间，令 $ep_{l,r}$ 表示下标 $l$ 到 $r$ 之间的所有起点站对应的终点站的下标的最大值，令 $p_{l,r}$ 表示下标 $l$ 到 $r$ 之间的站点位置的最小值，令 $dis_{l,r}$ 表示下标 $l$ 到 $r$ 之间的所有起点站到其对应的终点站的距离的最小值，将这些丢到线段树去维护。

接下来考虑对于每种操作怎么去处理。

对于操作一，我们要让起点在 $x$ 之后的线路的首个可达终点站与 $y+1$ 取 $\max$，容易知道 $ep$ 这个东西是单调不减的，所以真的会修改到的地方就是 $x$ 到最后一个 $ep \le y+1$ 的位置，要找出这个右界，显然可以在线段树上跑二分。

对于操作二，起点站肯定是要在 $[1,x]$ 之间的，这里依旧可以分成两部分。前半部分是 $ep \le y$ 的，也就是其第一个终点站在 $y$ 之前，这也意味着 $y$ 完全可以作为其终点站之一，这玩意的 $dis$ 在线段树里面弄出来的时候，默认是只走到 $ep$ 的，并不是走到 $y$，所以这里我们不求 $dis$ 而求得其最大的 $p$，从这个 $p$ 走到 $y$；后半部分是 $ep > y$ 的，根据题目要求，尽管我们提前在 $y$ 下车不走到 $ep$ 这个位置，距离也是要算到这个 $ep$ 的，所以对于这部分答案直接求其 $dis$ 的 $\min$ 即可。这两种情况的分界点就是最后一个 $ep=y$ 的位置，显然还是用线段树二分可以求得。

注意有些情况的区间可能是空集，放进线段树修改可能会出问题，特判一下即可。

## 代码

```cpp
#define int long long
#define _rep(i,a,b) for (int i=(a);i<=(b);++i)

template<
    class ValueType,
    void (*UP)(ValueType&,ValueType&,ValueType&),
    void (*DOWN)(ValueType&,ValueType&,ValueType&),
    class ModifyType,
    void (*MODIFY)(ValueType&,ModifyType&)
>
class SEG {
    public:

    struct Seg {
        int l,r;
        ValueType v;
    } *tr;

    SEG(int N) {
        tr=new Seg[N<<2];
        memset(tr,0,sizeof(Seg)*(N<<2));
        build(1,1,N);
    }

    SEG(int N,ValueType* arr) {
        tr=new Seg[N<<2];
        memset(tr,0,sizeof(Seg)*(N<<2));
        build(1,1,N,arr);
    }

    ~SEG() {
        delete[] tr;
    }

    SEG(const SEG&)=delete;
    SEG& operator=(const SEG&)=delete;

    void pushup(int u) {
        UP(tr[u].v,tr[u<<1].v,tr[u<<1|1].v);
    }

    void pushdown(int u) {
        auto& root=tr[u],&left=tr[u<<1],&right=tr[u<<1|1];
        DOWN(root.v,left.v,right.v);
    }

    void build(int u,int l,int r) {
        tr[u].l=l,tr[u].r=r,tr[u].v.len=(r-l+1);
        if (l==r) return;
        int mid=l+r>>1;
        build(u<<1,l,mid); build(u<<1|1,mid+1,r);
        pushup(u);
    }

    void build(int u,int l,int r,ValueType* arr) {
        tr[u].l=l,tr[u].r=r,tr[u].v=arr[l],tr[u].v.len=(r-l+1);
        if (l==r) return;
        int mid=l+r>>1;
        build(u<<1,l,mid,arr); build(u<<1|1,mid+1,r,arr);
        pushup(u);
    }

    void modify(int u,int l,int r,ModifyType k) {
        if (tr[u].l>=l && tr[u].r<=r) {
            MODIFY(tr[u].v,k);
        } else {
            pushdown(u);
            int mid=tr[u].l+tr[u].r>>1;
            if (l<=mid) modify(u<<1,l,r,k);
            if (r>mid) modify(u<<1|1,l,r,k);
            pushup(u);
        }
    }

    ValueType query(int u,int l,int r) {
        if (tr[u].l>=l && tr[u].r<=r) return tr[u].v;
        pushdown(u);
        int mid=tr[u].l+tr[u].r>>1;
        ValueType ans,L,R;
        if (l<=mid) L=query(u<<1,l,r);
        if (r>mid) R=query(u<<1|1,l,r);
        UP(ans,L,R);
        return ans;
    }
};

const int N=100005;
const int inf=1e18;

int T,n,m;
int p[N];

struct val {
    int len;
    int p; // p (max)
    int ep; // index (max)
    int tep; // tag end pos, index (max)
    int dis; // p (min)
    val(): len(0),p(0),ep(0),tep(0),dis(inf) {}
};

struct dat {
    int t;
    int k;
};

void pushup(val& u,val& l,val& r) {
    u.p=max(l.p,r.p);
    u.ep=max(l.ep,r.ep);
    u.dis=min(l.dis,r.dis);
}

void pushdown(val& u,val& l,val& r) {
    if (u.tep) {
        l.tep=r.tep=u.tep;
        l.ep=r.ep=u.tep;
        l.dis=p[u.tep]-l.p;
        r.dis=p[u.tep]-r.p;
        u.tep=0;
    }
}

void modify(val& u,dat& k) {
    if (k.t==0) {
        u.p=p[k.k],u.ep=k.k+1,u.dis=p[u.ep]-u.p;
    } else if (k.t==1) {
        u.ep=k.k;
        u.tep=k.k;
        u.dis=p[k.k]-u.p;
    }
}

void test(int u,int l,int r,SEG<val,pushup,pushdown,dat,modify>& seg) {
    // cout<<"now: "<<l<<" "<<r<<endl;
    if (l==r) {
        cout<<"test: "<<l<<": ";
        cout<<seg.tr[u].v.p<<" "<<seg.tr[u].v.ep<<" "<<seg.tr[u].v.dis<<endl;
    } else {
        seg.pushdown(u);
        int mid=l+r>>1;
        test(u<<1,l,mid,seg);
        test(u<<1|1,mid+1,r,seg);
    }
}

i32 main() {
    // FRR("train/train9.in");
    // FRW("train/my.out");
    // TIMESTAMP
    read(T);
    // int tt=0;
    while (T--) {
        // tt++;
        read(n),read(m);
        SEG<val,pushup,pushdown,dat,modify> seg(n);
        _rep(i,1,n) read(p[i]); p[n+1]=inf;
        _rep(i,1,n) seg.modify(1,i,i,dat{0,i});
        // int ope=0;
        while (m--) {
            // ope++;
            int op,x,y;
            read(op),read(x),read(y);
            // cerr<<"debug: "<<tt<<" "<<ope<<" start"<<endl;
            // if (tt==1 && ope==2996) {
            //     cerr<<"input: "<<op<<" "<<x<<" "<<y<<endl;
            // }
            if (op==1) {
                int u=1;
                while (seg.tr[u].l!=seg.tr[u].r) {
                    seg.pushdown(u);
                    int mid=seg.tr[u].l+seg.tr[u].r>>1;
                    if (mid<x) u=(u<<1|1);
                    else {
                        if (seg.tr[u<<1].v.ep<=y+1) u=(u<<1|1);
                        else u<<=1;
                    }
                }
                int pos=seg.tr[u].l;
                if (seg.tr[u].v.ep<=y+1) pos++;
                pos--;
                // if (tt==1 && ope==2996) {
                //     cerr<<"find u: "<<u<<endl;
                //     cerr<<"pos: "<<pos<<endl;
                //     cerr<<"modify: "<<x<<" "<<pos<<" "<<y+1<<endl;
                // }
                if (x<=pos) seg.modify(1,x,pos,dat{1,y+1});
            } else {
                int u=1;
                while (seg.tr[u].l!=seg.tr[u].r) {
                    seg.pushdown(u);
                    int mid=seg.tr[u].l+seg.tr[u].r>>1;
                    if (mid+1>x) u<<=1;
                    else {
                        if (seg.tr[u<<1].v.ep<=y) u=(u<<1|1);
                        else u<<=1;
                    }
                }
                int pos=seg.tr[u].l;
                if (seg.tr[u].v.ep<=y) pos++;
                // cout<<"res: "<<pos<<" "<<x<<endl;
                val res;
                if (pos>x) res.dis=inf;
                else res=seg.query(1,pos,x);
                // cout<<"resdis: "<<res.dis<<endl;
                // cout<<"ret: "<<1<<" "<<pos-1<<endl;
                val ret;
                if (1>pos-1) ret.p=-inf;
                else ret=seg.query(1,1,pos-1);
                // cout<<"retp: "<<ret.p<<endl;
                int ans=min(res.dis,p[y]-ret.p);
                // cout<<"getans: "<<ans<<endl;
                if (ans>1e9) puts("-1");
                else writeln(ans);
            }
            // cerr<<"debug: "<<tt<<" "<<ope<<" end"<<endl;
            // test(1,1,n,seg);
        }
    }
    // TIMESTAMP
    return 0;
}
```
