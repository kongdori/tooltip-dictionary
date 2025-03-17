!(function e(n, t, o) {
    function r(a, c) {
        if (!t[a]) {
            if (!n[a]) {
                var u = "function" == typeof require && require;
                if (!c && u) return u(a, !0);
                if (i) return i(a, !0);
                var s = new Error("Cannot find module '" + a + "'");
                throw ((s.code = "MODULE_NOT_FOUND"), s);
            }
            var g = (t[a] = { exports: {} });
            n[a][0].call(
                g.exports,
                function (e) {
                    var t = n[a][1][e];
                    return r(t || e);
                },
                g,
                g.exports,
                e,
                n,
                t,
                o
            );
        }
        return t[a].exports;
    }
    for (var i = "function" == typeof require && require, a = 0; a < o.length; a++) r(o[a]);
    return r;
})(
    {
        1: [
            function (e, n, t) {
                "use strict";
                Object.defineProperty(t, "__esModule", { value: !0 }),
                    (t.defaultOptions = {
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
                    (t.setOptions = function (e) {
                        return new Promise(function (n, t) {
                            chrome.storage.sync.set(e, n);
                        });
                    }),
                    (t.getOptions = function (e) {
                        return new Promise(function (n, t) {
                            chrome.storage.sync.get(e, n);
                        });
                    });
            },
            {},
        ],
        2: [
            function (e, n, t) {
                "use strict";
                Object.defineProperty(t, "__esModule", { value: !0 });
                var o = e("./OptionStorage"),
                    r = e("./utils");
                o.getOptions()
                    .then(function (e) {
                        0 == Object.keys(e).length && o.setOptions(o.defaultOptions);
                    })
                    .then(function () {
                        return o.getOptions("active");
                    })
                    .then(function (e) {
                        r.changeIcon(e.active);
                    });
                chrome.runtime.onMessage.addListener(function (e, n, t) {
                    if (e.query) {
                        var o = "http://tooltip.dic.naver.com/tooltip.nhn?wordString=<query>&languageCode=4&nlp=false".replace("<query>", encodeURIComponent(e.query.toLowerCase()));
                        return (
                            fetch(o)
                                .then(function (e) {
                                    return e.json();
                                })
                                .then(function (n) {
                                    return t(n && n.mean ? { word: e.query, mean: n.mean } : null);
                                }),
                            !0
                        );
                    }
                });
            },
            { "./OptionStorage": 1, "./utils": 3 },
        ],
        3: [
            function (e, n, t) {
                "use strict";
                Object.defineProperty(t, "__esModule", { value: !0 }),
                    (t.domReady = function () {
                        return new Promise(function (e, n) {
                            "interactive" === document.readyState || "complete" === document.readyState ? e() : document.addEventListener("DOMContentLoaded", e);
                        });
                    });
                var o = { 16: "images/nonactive16.png", 32: "images/nonactive32.png", 48: "images/nonactive48.png", 64: "images/nonactive64.png", 96: "images/nonactive96.png", 128: "images/nonactive128.png" },
                    r = { 16: "images/active16.png", 32: "images/active32.png", 48: "images/active48.png", 64: "images/active64.png", 96: "images/active96.png", 128: "images/active128.png" };
                t.changeIcon = function (e) {
                    var n = e ? r : o;
                    chrome.browserAction.setIcon({ path: n });
                };
            },
            {},
        ],
    },
    {},
    [2]
);
