! function (n, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports, require("d3-array"), require("d3-shape")) : "function" == typeof define && define.amd ? define(["exports", "d3-array", "d3-shape"], t) : t((n = n || self).d3 = n.d3 || {}, n.d3, n.d3)
}(this, function (n, t, e) {
    "use strict";

    function o(n) {
        return n.target.depth
    }

    function r(n, t) {
        return n.sourceLinks.length ? n.depth : t - 1
    }

    function i(n) {
        return function () {
            return n
        }
    }

    function s(n, t) {
        return u(n.source, t.source) || n.index - t.index
    }

    function f(n, t) {
        return u(n.target, t.target) || n.index - t.index
    }

    function u(n, t) {
        return n.y0 - t.y0
    }

    function c(n) {
        return n.value
    }

    function l(n) {
        return n.index
    }

    function a(n) {
        return n.nodes
    }

    function d(n) {
        return n.links
    }

    function h(n, t) {
        const e = n.get(t);
        if (!e) throw new Error("missing: " + t);
        return e
    }

    function g({
        nodes: n
    }) {
        for (const t of n) {
            let n = t.y0,
                e = n;
            for (const e of t.sourceLinks) e.y0 = n + e.width / 2, n += e.width;
            for (const n of t.targetLinks) n.y1 = e + n.width / 2, e += n.width
        }
    }

    function y(n) {
        return [n.source.x1, n.y0]
    }

    function k(n) {
        return [n.target.x0, n.y1]
    }
    n.sankey = function () {
        let n, e, o, y = 0,
            k = 0,
            L = 1,
            p = 1,
            w = 24,
            x = 8,
            m = l,
            v = r,
            M = a,
            b = d,
            S = 12;

        function z() {
            const r = {
                nodes: M.apply(null, arguments),
                links: b.apply(null, arguments)
            };
            return function ({
                nodes: n,
                links: t
            }) {
                for (const [t, e] of n.entries()) e.index = t, e.sourceLinks = [], e.targetLinks = [];
                const e = new Map(n.map((t, e) => [m(t, e, n), t]));
                for (const [n, o] of t.entries()) {
                    o.index = n;
                    let {
                        source: t,
                        target: r
                    } = o;
                    "object" != typeof t && (t = o.source = h(e, t)), "object" != typeof r && (r = o.target = h(e, r)), t.sourceLinks.push(o), r.targetLinks.push(o)
                }
                if (null != o)
                    for (const {
                        sourceLinks: t,
                        targetLinks: e
                    }
                        of n) t.sort(o), e.sort(o)
            }(r),
                function ({
                    nodes: n
                }) {
                    for (const e of n) e.value = void 0 === e.fixedValue ? Math.max(t.sum(e.sourceLinks, c), t.sum(e.targetLinks, c)) : e.fixedValue
                }(r),
                function ({
                    nodes: n
                }) {
                    const t = n.length;
                    let e = new Set(n),
                        o = new Set,
                        r = 0;
                    for (; e.size;) {
                        for (const n of e) {
                            n.depth = n.layer;
                            for (const {
                                target: t
                            }
                                of n.sourceLinks) o.add(t)
                        }
                        if (++r > t) throw new Error("circular link");
                        e = o, o = new Set
                    }
                }(r),
                function ({
                    nodes: n
                }) {
                    const t = n.length;
                    let e = new Set(n),
                        o = new Set,
                        r = 0;
                    for (; e.size;) {
                        for (const n of e) {
                            n.height = r;
                            for (const {
                                source: t
                            }
                                of n.targetLinks) o.add(t)
                        }
                        if (++r > t) throw new Error("circular link");
                        e = o, o = new Set
                    }
                }(r),
                function (o) {
                    const r = function ({
                        nodes: n
                    }) {
                        const o = t.max(n, n => n.depth) + 1,
                            r = (L - y - w) / (o - 1),
                            i = new Array(o);
                        for (const t of n) {
                            const asd = v.call(null, t, o)
                            const n = Math.max(0, Math.min(o - 1, Math.floor(asd)));
                            console.log(n, o, asd)
                            t.layer = n, t.x0 = y + n * r, t.x1 = t.x0 + w, i[n] ? i[n].push(t) : i[n] = [t]
                            console.log(t.layer, t.depth, t.x0)
                        }
                        if (e)
                            for (const n of i) n.sort(e);
                        return i
                    }(o);
                    n = Math.min(x, (p - k) / (t.max(r, n => n.length) - 1)),
                        function (e) {
                            const o = t.min(e, e => (p - k - (e.length - 1) * n) / t.sum(e, c));
                            for (const t of e) {
                                let e = k;
                                for (const r of t) {
                                    r.y0 = e, r.y1 = e + r.value * o, e = r.y1 + n;
                                    for (const n of r.sourceLinks) n.width = n.value * o
                                }
                                e = (p - e + n) / (t.length + 1);
                                for (let n = 0; n < t.length; ++n) {
                                    const o = t[n];
                                    o.y0 += e * (n + 1), o.y1 += e * (n + 1)
                                }
                                V(t)
                            }
                        }(r);
                    for (let n = 0; n < S; ++n) {
                        const t = Math.pow(.99, n),
                            e = Math.max(1 - t, (n + 1) / S);
                        E(r, t, e), j(r, t, e)
                    }
                }(r), g(r), r
        }

        function j(n, t, o) {
            for (let r = 1, i = n.length; r < i; ++r) {
                const i = n[r];
                for (const n of i) {
                    let e = 0,
                        o = 0;
                    for (const {
                        source: t,
                        value: r
                    }
                        of n.targetLinks) {
                        let i = r * (n.layer - t.layer);
                        e += _(t, n) * i, o += i
                    }
                    if (!(o > 0)) continue;
                    let r = (e / o - n.y0) * t;
                    n.y0 += r, n.y1 += r, P(n)
                }
                void 0 === e && i.sort(u), q(i, o)
            }
        }

        function E(n, t, o) {
            for (let r = n.length - 2; r >= 0; --r) {
                const i = n[r];
                for (const n of i) {
                    let e = 0,
                        o = 0;
                    for (const {
                        target: t,
                        value: r
                    }
                        of n.sourceLinks) {
                        let i = r * (t.layer - n.layer);
                        e += C(n, t) * i, o += i
                    }
                    if (!(o > 0)) continue;
                    let r = (e / o - n.y0) * t;
                    n.y0 += r, n.y1 += r, P(n)
                }
                void 0 === e && i.sort(u), q(i, o)
            }
        }

        function q(t, e) {
            const o = t.length >> 1,
                r = t[o];
            H(t, r.y0 - n, o - 1, e), A(t, r.y1 + n, o + 1, e), H(t, p, t.length - 1, e), A(t, k, 0, e)
        }

        function A(t, e, o, r) {
            for (; o < t.length; ++o) {
                const i = t[o],
                    s = (e - i.y0) * r;
                s > 1e-6 && (i.y0 += s, i.y1 += s), e = i.y1 + n
            }
        }

        function H(t, e, o, r) {
            for (; o >= 0; --o) {
                const i = t[o],
                    s = (i.y1 - e) * r;
                s > 1e-6 && (i.y0 -= s, i.y1 -= s), e = i.y0 - n
            }
        }

        function P({
            sourceLinks: n,
            targetLinks: t
        }) {
            if (void 0 === o) {
                for (const {
                    source: {
                        sourceLinks: n
                    }
                }
                    of t) n.sort(f);
                for (const {
                    target: {
                        targetLinks: t
                    }
                }
                    of n) t.sort(s)
            }
        }

        function V(n) {
            if (void 0 === o)
                for (const {
                    sourceLinks: t,
                    targetLinks: e
                }
                    of n) t.sort(f), e.sort(s)
        }

        function _(t, e) {
            let o = t.y0 - (t.sourceLinks.length - 1) * n / 2;
            for (const {
                target: r,
                width: i
            }
                of t.sourceLinks) {
                if (r === e) break;
                o += i + n
            }
            for (const {
                source: n,
                width: r
            }
                of e.targetLinks) {
                if (n === t) break;
                o -= r
            }
            return o
        }

        function C(t, e) {
            let o = e.y0 - (e.targetLinks.length - 1) * n / 2;
            for (const {
                source: r,
                width: i
            }
                of e.targetLinks) {
                if (r === t) break;
                o += i + n
            }
            for (const {
                target: n,
                width: r
            }
                of t.sourceLinks) {
                if (n === e) break;
                o -= r
            }
            return o
        }
        return z.update = function (n) {
            return g(n), n
        }, z.nodeId = function (n) {
            return arguments.length ? (m = "function" == typeof n ? n : i(n), z) : m
        }, z.nodeAlign = function (n) {
            return arguments.length ? (v = "function" == typeof n ? n : i(n), z) : v
        }, z.nodeSort = function (n) {
            return arguments.length ? (e = n, z) : e
        }, z.nodeWidth = function (n) {
            return arguments.length ? (w = +n, z) : w
        }, z.nodePadding = function (t) {
            return arguments.length ? (x = n = +t, z) : x
        }, z.nodes = function (n) {
            return arguments.length ? (M = "function" == typeof n ? n : i(n), z) : M
        }, z.links = function (n) {
            return arguments.length ? (b = "function" == typeof n ? n : i(n), z) : b
        }, z.linkSort = function (n) {
            return arguments.length ? (o = n, z) : o
        }, z.size = function (n) {
            return arguments.length ? (y = k = 0, L = +n[0], p = +n[1], z) : [L - y, p - k]
        }, z.extent = function (n) {
            return arguments.length ? (y = +n[0][0], L = +n[1][0], k = +n[0][1], p = +n[1][1], z) : [
                [y, k],
                [L, p]
            ]
        }, z.iterations = function (n) {
            return arguments.length ? (S = +n, z) : S
        }, z
    }, n.sankeyCenter = function (n) {
        return n.targetLinks.length ? n.depth : n.sourceLinks.length ? t.min(n.sourceLinks, o) - 1 : 0
    }, n.sankeyJustify = r, n.sankeyLeft = function (n) {
        return n.depth
    }, n.sankeyLinkHorizontal = function () {
        return e.linkHorizontal().source(y).target(k)
    }, n.sankeyRight = function (n, t) {
        return t - 1 - n.height
    }, Object.defineProperty(n, "__esModule", {
        value: !0
    })
});