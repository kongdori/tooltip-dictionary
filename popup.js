!(function e(t, n, o) {
    function i(a, c) {
        if (!n[a]) {
            if (!t[a]) {
                var u = "function" == typeof require && require;
                if (!c && u) return u(a, !0);
                if (r) return r(a, !0);
                var l = new Error("Cannot find module '" + a + "'");
                throw ((l.code = "MODULE_NOT_FOUND"), l);
            }
            var s = (n[a] = { exports: {} });
            t[a][0].call(
                s.exports,
                function (e) {
                    var n = t[a][1][e];
                    return i(n || e);
                },
                s,
                s.exports,
                e,
                t,
                n,
                o
            );
        }
        return n[a].exports;
    }
    for (var r = "function" == typeof require && require, a = 0; a < o.length; a++) i(o[a]);
    return i;
})(
    {
        1: [
            function (e, t, n) {
                "use strict";
                Object.defineProperty(n, "__esModule", { value: !0 }),
                    (n.defaultOptions = {
                        active: !0,
                        tooltipYOffset: 30,
                        tooltipYPosition: "down",
                        fontSize: 9,
                        fontWeight: "normal",
                        textColor: "rgb(241, 241, 241)",
                        backgroundGradColorTop: "rgb(105, 105, 105)",
                        backgroundGradColorBottom: "rgb(84, 84, 84)",
                        borderColor: "#707070",
                        delayTime: 200,
                    }),
                    (n.setOptions = function (e) {
                        return new Promise(function (t, n) {
                            chrome.storage.sync.set(e, t);
                        });
                    }),
                    (n.getOptions = function (e) {
                        return new Promise(function (t, n) {
                            chrome.storage.sync.get(e, t);
                        });
                    });
            },
            {},
        ],
        2: [
            function (e, t, n) {
                "use strict";
                function o(e, t, n) {
                    return t in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : (e[t] = n), e;
                }
                function i() {
                    document.getElementById("active_control").addEventListener("click", function () {
                        var e = this.checked;
                        c.setOptions({ active: e }).then(u.changeIcon(e));
                    });
                }
                function r() {
                    for (var e = document.getElementsByTagName("select"), t = 0; t < e.length; t++)
                        $(e[t]).on("change", function () {
                            var e = $("#" + this.id + " option:selected").val();
                            e = isNaN(Number(e)) ? String(e) : Number(e);
                            var t = this.id.split("_")[0];
                            c.setOptions(o({}, t, e));
                        });
                }
                function a(e, t) {
                    var n = document.getElementById(e),
                        o = !0,
                        i = !1,
                        r = void 0;
                    try {
                        for (var a, c = t[Symbol.iterator](); !(o = (a = c.next()).done); o = !0) {
                            var u = a.value,
                                l = document.createElement("option");
                            (l.value = String(u).toLocaleLowerCase()), (l.text = u), n.appendChild(l);
                        }
                    } catch (e) {
                        (i = !0), (r = e);
                    } finally {
                        try {
                            !o && c.return && c.return();
                        } finally {
                            if (i) throw r;
                        }
                    }
                }
                Object.defineProperty(n, "__esModule", { value: !0 });
                var c = e("./optionStorage"),
                    u = e("./utils"),
                    l = function (e, t) {
                        for (var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1, o = [], i = Math.floor((t - e) / n), r = 0; r <= i; r++) o.push(r * n + e);
                        return o;
                    };
                i(),
                    a("delayTime_control", l(100, 1e3, 100)),
                    a("fontSize_control", l(5, 15)),
                    a("tooltipYPosition_control", ["Down", "Up"]),
                    r(),
                    u
                        .domReady()
                        .then(function () {
                            return c.getOptions();
                        })
                        .then(function (e) {
                            (document.getElementById("active_control").checked = e.active),
                                (document.getElementById("delayTime_control").value = e.delayTime),
                                (document.getElementById("fontSize_control").value = e.fontSize),
                                (document.getElementById("tooltipYPosition_control").value = e.tooltipYPosition);
                        })
                        .then(function () {
                            $("select").material_select();
                        });
            },
            { "./optionStorage": 1, "./utils": 3 },
        ],
        3: [
            function (e, t, n) {
                "use strict";
                Object.defineProperty(n, "__esModule", { value: !0 }),
                    (n.domReady = function () {
                        return new Promise(function (e, t) {
                            "interactive" === document.readyState || "complete" === document.readyState ? e() : document.addEventListener("DOMContentLoaded", e);
                        });
                    });
                var o = { 16: "images/nonactive16.png", 32: "images/nonactive32.png", 48: "images/nonactive48.png", 64: "images/nonactive64.png", 96: "images/nonactive96.png", 128: "images/nonactive128.png" },
                    i = { 16: "images/active16.png", 32: "images/active32.png", 48: "images/active48.png", 64: "images/active64.png", 96: "images/active96.png", 128: "images/active128.png" };
                n.changeIcon = function (e) {
                    var t = e ? i : o;
                    chrome.browserAction.setIcon({ path: t });
                };
            },
            {},
        ],
    },
    {},
    [2]
);
