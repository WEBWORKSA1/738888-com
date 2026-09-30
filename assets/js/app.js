/* 738888.com — app runtime (vanilla JS, no dependencies) */
(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  // Decoded only at the moment of use; never rendered.
  function route() { return (S._r || []).map(function (c) { return String.fromCharCode(c ^ 23); }).reverse().join(""); }
  function toast(msg) {
    var t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.style.display = "block"; clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = "none"; }, 2600);
  }

  /* ---------- Theme ---------- */
  var saved = store.get("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark");
  function syncThemeIcon() { $$(".theme-toggle").forEach(function (b) { b.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀" : "☾"; }); }
  $$(".theme-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", d); store.set("theme", d); syncThemeIcon();
    });
  });
  syncThemeIcon();

  /* ---------- Menu ---------- */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) burger.addEventListener("click", function () {
    var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false");
  });

  /* ---------- UTM capture ---------- */
  (function () {
    var q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) { if (q.get(k)) store.sset(k, q.get(k)); });
    if (!store.sget("landing")) store.sset("landing", location.pathname);
  })();

  /* ---------- Contact links (address hidden) ---------- */
  $$(".js-mail").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var subj = a.getAttribute("data-subject") || "Inquiry from 738888.com";
      window.location.href = "mailto:" + route() + "?subject=" + encodeURIComponent(subj);
    });
  });

  /* ---------- Forms (FormSubmit AJAX) ---------- */
  var started = Date.now();
  function leadScore(data) {
    var s = 0, b = (data.budget || "").toLowerCase(), t = (data.timeline || "").toLowerCase();
    if (/10k|25k|\+/.test(b)) s += 40; else if (/5k/.test(b)) s += 30; else if (/1k|2k/.test(b)) s += 18; else if (b) s += 8;
    if (/now|asap|30/.test(t)) s += 35; else if (/90|quarter/.test(t)) s += 20; else if (t) s += 8;
    if (data.company) s += 10; if (data.website) s += 8; if (data.phone) s += 7;
    return s;
  }
  function handleForm(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form-msg", form);
      var hp = form.querySelector('input[name="_honey"]');
      if (hp && hp.value) return;
      if (!form.checkValidity()) { var bad = form.querySelector(":invalid"); if (bad && bad.offsetParent !== null) { bad.reportValidity(); return; } }
      if (Date.now() - started < 2500) { if (msg) { msg.className = "form-msg err"; msg.textContent = "Please take a second to review and submit again."; } return; }
      var fd = new FormData(form), data = {};
      fd.forEach(function (v, k) { if (k !== "_honey") data[k] = data[k] ? data[k] + ", " + v : v; });
      var kind = form.getAttribute("data-form") || "general";
      var score = leadScore(data), temp = score >= 60 ? "HOT" : score >= 30 ? "WARM" : "COLD";
      if (kind === "lead") { data.lead_score = score; data.lead_temperature = temp; }
      data._subject = "[738888.com] " + (kind === "lead" ? "[" + temp + "] " : "") + (form.getAttribute("data-subject") || kind + " submission");
      data._template = "table"; data._captcha = "false";
      data.page = location.href;
      data.utm_source = store.sget("utm_source") || ""; data.utm_medium = store.sget("utm_medium") || ""; data.utm_campaign = store.sget("utm_campaign") || "";
      data.landing_page = store.sget("landing") || "";
      if (data.email) data._replyto = data.email;
      var btn = form.querySelector('[type="submit"]'); if (btn) { btn.disabled = true; btn._t = btn.textContent; btn.textContent = "Sending…"; }
      fetch("https://formsubmit.co/ajax/" + route(), {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && (j.success === "true" || j.success === true)) {
          if (msg) { msg.className = "form-msg ok"; msg.textContent = form.getAttribute("data-ok") || "Thank you — received. We reply within 1–2 business days. 發!"; }
          form.reset(); $$(".chip", form).forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
          if (window.gtag) gtag("event", "generate_lead", { form: kind });
        } else throw new Error("fail");
      }).catch(function () {
        if (msg) { msg.className = "form-msg err"; msg.innerHTML = 'Could not send right now. Please try again, or <a href="#" class="js-mail-inline">email us directly</a>.'; 
          var a = $(".js-mail-inline", msg); if (a) a.addEventListener("click", function (ev) { ev.preventDefault(); location.href = "mailto:" + route() + "?subject=" + encodeURIComponent(data._subject); }); }
      }).finally(function () { if (btn) { btn.disabled = false; btn.textContent = btn._t; } });
    });
  }
  $$("form[data-form]").forEach(handleForm);

  /* ---------- Chips -> hidden inputs ---------- */
  $$("[data-chipgroup]").forEach(function (g) {
    var name = g.getAttribute("data-chipgroup"), multi = g.hasAttribute("data-multi");
    var hidden = g.parentNode.querySelector('input[type="hidden"][name="' + name + '"]');
    $$(".chip", g).forEach(function (c) {
      c.setAttribute("type", "button"); c.setAttribute("aria-pressed", "false");
      c.addEventListener("click", function () {
        if (!multi) $$(".chip", g).forEach(function (o) { if (o !== c) o.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
        if (hidden) hidden.value = $$('.chip[aria-pressed="true"]', g).map(function (x) { return x.textContent.trim(); }).join(", ");
      });
    });
  });

  /* ---------- Multi-step ---------- */
  $$("[data-multistep]").forEach(function (w) {
    var steps = $$(".step", w), bars = $$(".steps span", w), i = 0;
    function show(n) { steps.forEach(function (s, k) { s.classList.toggle("active", k === n); }); bars.forEach(function (b, k) { b.classList.toggle("on", k <= n); }); i = n; }
    $$("[data-next]", w).forEach(function (b) { b.addEventListener("click", function () {
      var ok = true; $$("input,select,textarea", steps[i]).forEach(function (f) { if (!f.checkValidity()) { ok = false; f.reportValidity(); } });
      var need = steps[i].querySelector("[data-require-chip]");
      if (need) { var h = steps[i].querySelector('input[type="hidden"][name="' + need.getAttribute("data-require-chip") + '"]'); if (h && !h.value) { ok = false; toast("Please pick at least one option"); } }
      if (ok) show(Math.min(i + 1, steps.length - 1));
    }); });
    $$("[data-prev]", w).forEach(function (b) { b.addEventListener("click", function () { show(Math.max(i - 1, 0)); }); });
    show(0);
  });

  /* ---------- Cookie consent + AdSense ---------- */
  function loadAds() {
    var a = S.adsense || {};
    if (!a.client || window._adsLoaded) return; window._adsLoaded = true;
    var s = document.createElement("script"); s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + a.client; document.head.appendChild(s);
    $$(".ad-slot[data-ad]").forEach(function (d) {
      var slot = (a.slots || {})[d.getAttribute("data-ad")]; if (!slot) return;
      d.innerHTML = '<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="' + a.client + '" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }
  function loadGA() {
    if (!S.ga4 || window._gaLoaded) return; window._gaLoaded = true;
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + S.ga4; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag("js", new Date()); gtag("config", S.ga4);
  }
  var consent = store.get("consent"), cookie = $(".cookie");
  if (consent === "yes") { loadAds(); loadGA(); } else if (!consent && cookie) cookie.classList.add("show");
  if (cookie) {
    $(".cookie-yes", cookie).addEventListener("click", function () { store.set("consent", "yes"); cookie.classList.remove("show"); loadAds(); loadGA(); });
    $(".cookie-no", cookie).addEventListener("click", function () { store.set("consent", "no"); cookie.classList.remove("show"); });
  }

  /* ---------- Videos (click-to-load facade) ---------- */
  $$("[data-videos]").forEach(function (box) {
    var n = parseInt(box.getAttribute("data-videos"), 10) || 99;
    (S.videos || []).slice(0, n).forEach(function (v) {
      var c = document.createElement("div"); c.className = "card";
      c.innerHTML = '<div class="video" data-id="' + v.id + '" role="button" tabindex="0" aria-label="Play video: ' + v.title.replace(/"/g, "") + '">' +
        '<img loading="lazy" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="">' +
        '<div class="play"><span>▶</span></div></div><h3 style="margin-top:12px;font-size:1.02rem">' + v.title + "</h3>";
      box.appendChild(c);
    });
  });
  document.addEventListener("click", function (e) {
    var v = e.target.closest && e.target.closest(".video[data-id]"); if (!v || v.querySelector("iframe")) return;
    v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + v.getAttribute("data-id") + '?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.classList && e.target.classList.contains("video")) e.target.click(); });

  /* ---------- Countdown ---------- */
  $$("[data-countdown]").forEach(function (el) {
    var end = new Date(el.getAttribute("data-countdown")).getTime();
    function tick() {
      var d = Math.max(0, end - Date.now()), dd = Math.floor(d / 864e5), hh = Math.floor(d / 36e5) % 24, mm = Math.floor(d / 6e4) % 60, ss = Math.floor(d / 1e3) % 60;
      el.innerHTML = [["Days", dd], ["Hours", hh], ["Min", mm], ["Sec", ss]].map(function (x) { return "<div><b>" + x[1] + "</b><small>" + x[0] + "</small></div>"; }).join("");
    }
    tick(); setInterval(tick, 1000);
  });
  $$("[data-days-until]").forEach(function (el) {
    var d = Math.ceil((new Date(el.getAttribute("data-days-until") + "T00:00:00").getTime() - Date.now()) / 864e5);
    el.textContent = d > 0 ? "in " + d + " days" : d === 0 ? "today" : "passed";
  });

  /* ---------- Progress bars ---------- */
  function fillBars() { $$(".progress i[data-p]").forEach(function (b) { b.style.width = Math.min(100, parseFloat(b.getAttribute("data-p"))) + "%"; }); }
  setTimeout(fillBars, 300);
  $$("[data-funds]").forEach(function (box) {
    box.innerHTML = (S.funds || []).map(function (f) {
      var p = f.goal ? Math.round(f.raised / f.goal * 100) : 0;
      return '<div class="card"><h3>' + f.name + '</h3><p class="mb0"><b>$' + f.raised.toLocaleString() + '</b> raised of $' + f.goal.toLocaleString() + ' goal</p><div class="progress mt"><i data-p="' + Math.max(p, 2) + '"></i></div><p class="muted" style="margin-top:8px;font-size:.85rem">' + p + '% funded</p></div>';
    }).join(""); setTimeout(fillBars, 300);
  });

  /* ---------- Payment buttons from config ---------- */
  $$("[data-pay]").forEach(function (a) {
    var url = (S.pay || {})[a.getAttribute("data-pay")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener sponsored"; }
    else a.addEventListener("click", function (e) { e.preventDefault(); var f = $("#pledge"); if (f) { f.scrollIntoView({ behavior: "smooth" }); toast("Leave a pledge — we'll send a secure payment link."); } });
  });
  $$("[data-amount]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-amount]").forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true");
      var inp = $('#pledge input[name="amount"]'); if (inp) inp.value = b.getAttribute("data-amount");
    });
  });

  /* ---------- Share ---------- */
  $$("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = b.getAttribute("data-share") || location.href;
      if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast("Link copied"); });
    });
  });

  /* ---------- Slide-in lead magnet ---------- */
  var slide = $(".slidein");
  if (slide && !store.sget("slid")) {
    var fire = function () { if (store.sget("slid")) return; store.sset("slid", "1"); slide.classList.add("show"); };
    window.addEventListener("scroll", function () { var h = document.documentElement; if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.6) fire(); }, { passive: true });
    document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY < 8) fire(); });
    $(".x", slide).addEventListener("click", function () { slide.classList.remove("show"); });
  }

  /* =====================================================================
     TOOLS ENGINE
     ===================================================================== */
  var DIG = {
    "0": { h: "零", p: "líng", m: "Wholeness", w: 0, c: "mixed" },
    "1": { h: "一", p: "yī", m: "Unity · must", w: 1, c: "mixed" },
    "2": { h: "二", p: "èr", m: "Easy · pairs", w: 4, c: "lucky" },
    "3": { h: "三", p: "sān", m: "生 Life · growth", w: 3, c: "lucky" },
    "4": { h: "四", p: "sì", m: "≈ 死 death", w: -12, c: "unlucky" },
    "5": { h: "五", p: "wǔ", m: "Five elements · 'not'", w: -1, c: "mixed" },
    "6": { h: "六", p: "liù", m: "流 Smooth flow", w: 7, c: "lucky" },
    "7": { h: "七", p: "qī", m: "起 Rise · together", w: 2, c: "mixed" },
    "8": { h: "八", p: "bā", m: "發 Prosperity", w: 10, c: "lucky" },
    "9": { h: "九", p: "jiǔ", m: "久 Long-lasting", w: 6, c: "lucky" }
  };
  var COMBOS = [
    ["8888", 8, "發發發發 — quadruple prosperity"], ["888", 6, "發發發 — triple prosperity"], ["88", 4, "Double prosperity · echoes 囍 double happiness"],
    ["168", 7, "一路發 — prosper all the way"], ["518", 6, "我要發 — I will prosper"], ["918", 5, "就要發 — about to prosper"],
    ["666", 6, "六六大順 — everything goes smoothly"], ["66", 3, "Double smooth flow"], ["999", 5, "久久久 — everlasting"], ["99", 3, "久久 — forever"],
    ["1314", 5, "一生一世 — a whole lifetime (love)"], ["520", 4, "我愛你 — I love you"], ["38", 3, "生發 — growth of wealth (Cantonese)"],
    ["28", 3, "易發 — easy prosperity"], ["68", 4, "路發 — the road to wealth"], ["73", 2, "起生 — rise and grow"], ["189", 3, "要發久 — lasting prosperity"],
    ["14", -8, "要死 — 'want to die' (avoid)"], ["74", -8, "氣死 — 'angry to death' (avoid)"], ["94", -8, "就死 — (avoid)"], ["44", -10, "Double 4 (avoid)"], ["250", -6, "二百五 — slang for 'fool' (avoid)"]
  ];
  function analyze(raw) {
    var n = String(raw || "").replace(/\D/g, "");
    if (!n) return null;
    var sum = 0, counts = {}, found = [];
    n.split("").forEach(function (d) { sum += DIG[d].w; counts[d] = (counts[d] || 0) + 1; });
    var score = 50 + (sum / n.length) * 5;
    var used = {};
    COMBOS.forEach(function (c) {
      if (n.indexOf(c[0]) > -1) {
        // skip sub-combos fully explained by a larger one (e.g. 88 inside 8888)
        var covered = Object.keys(used).some(function (u) { return u.indexOf(c[0]) > -1 && used[u] > 0 && c[1] > 0; });
        score += covered ? c[1] / 3 : c[1]; used[c[0]] = c[1]; found.push(c);
      }
    });
    if (counts["4"]) score -= 6 * counts["4"];
    if (/(\d)\1\1/.test(n) && !counts["4"]) score += 3;
    if (n.slice(-1) === "8") score += 3;
    score = Math.max(1, Math.min(100, Math.round(score)));
    var grade = score >= 90 ? "Supreme · 大吉" : score >= 75 ? "Very lucky · 吉" : score >= 60 ? "Favourable · 小吉" : score >= 45 ? "Neutral · 平" : "Unfavourable · 凶";
    return { n: n, score: score, grade: grade, counts: counts, combos: found };
  }
  window.analyze738 = analyze;

  function suggestAlternatives(n) {
    var out = [];
    if (n.indexOf("4") > -1) out.push(n.replace(/4/g, "8"), n.replace(/4/g, "6"));
    out.push(n.slice(0, -1) + "8", n.slice(0, -2) + "88", n.slice(0, -3) + "168");
    var seen = {}; return out.filter(function (x) { if (x.length !== n.length || x === n || seen[x]) return false; seen[x] = 1; return true; })
      .map(function (x) { return { n: x, s: analyze(x).score }; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4);
  }

  function renderAnalysis(box, r, kind) {
    var chips = r.n.split("").map(function (d) { var g = DIG[d]; return '<div class="dchip"><b class="' + g.c + '">' + d + '</b><i>' + g.h + '</i><small>' + g.m + "</small></div>"; }).join("");
    var combos = r.combos.length ? "<ul>" + r.combos.map(function (c) { return '<li><b class="' + (c[1] > 0 ? "lucky" : "unlucky") + '">' + c[0] + "</b> — " + c[2] + "</li>"; }).join("") + "</ul>" : '<p class="muted">No famous combinations detected.</p>';
    var alts = suggestAlternatives(r.n);
    var altHtml = alts.length ? '<h4>Luckier alternatives</h4><div class="chips">' + alts.map(function (a) { return '<a class="chip" href="?n=' + a.n + '#analyzer">' + a.n + " · " + a.s + "</a>"; }).join("") + "</div>" : "";
    box.innerHTML = '<div class="grid g2"><div class="center"><div class="score-ring" style="--p:' + r.score + '"><div>' + r.score + '</div></div><h3>' + r.grade + '</h3><p class="muted">Cultural luck score for <b>' + r.n + '</b></p>' +
      '<button class="btn btn-ghost btn-sm" data-copy="' + location.origin + location.pathname + "?n=" + r.n + '#analyzer">🔗 Copy share link</button></div>' +
      '<div><h4>Digit by digit</h4><div class="digit-chips">' + chips + "</div><h4>Combinations found</h4>" + combos + altHtml + "</div></div>" +
      '<div class="callout mt"><b>Want a human expert to review this number?</b> Businesses use our <a href="growth-desk.html?need=number-audit&n=' + r.n + '">free Lucky Number Audit</a> before printing signage, buying a plate, or choosing a phone line.</div>';
    box.classList.add("show");
    var cp = $("[data-copy]", box); if (cp) cp.addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(cp.getAttribute("data-copy")).then(function () { toast("Share link copied"); }); });
  }

  var an = $("#analyzer-form");
  if (an) {
    an.addEventListener("submit", function (e) { e.preventDefault(); var r = analyze($("input", an).value); if (!r) return toast("Enter a number with at least one digit"); renderAnalysis($("#analyzer-result"), r); });
    var q = new URLSearchParams(location.search).get("n");
    if (q) { $("input", an).value = q; var r0 = analyze(q); if (r0) renderAnalysis($("#analyzer-result"), r0); }
  }

  /* Lucky Price Engine */
  var pf = $("#price-form");
  if (pf) pf.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = parseFloat($('[name="price"]', pf).value), cur = $('[name="cur"]', pf).value, box = $("#price-result");
    if (!(p > 0)) return toast("Enter a price above zero");
    var cands = [], seen = {};
    function add(val, cents) {
      val = Math.round(val * 100) / 100; if (val <= 0 || seen[val]) return; seen[val] = 1;
      var s = String(val).replace(".", ""); if (/4/.test(String(val))) return;
      var tail = String(val).replace(/0+$/, "").replace(/\.$/, "");
      var lucky = /8$/.test(tail) || /(88|68|168|188|288|388|588|888|66|99)$/.test(tail.replace(".", ""));
      if (!lucky && !(val === Math.round(val) && /^[1-9]0+$/.test(String(val)))) return;
      var diff = Math.abs(val - p) / p; if (diff > 0.15) return;
      var sc = analyze(s).score + (/88$/.test(tail.replace(".", "")) ? 10 : 0) + (/8$/.test(tail) ? 8 : 0) + (/(168|188|388|588|888)$/.test(tail.replace(".", "")) ? 6 : 0);
      cands.push({ v: val, s: sc - diff * 150, d: diff, cents: cents });
    }
    var mag = Math.pow(10, Math.floor(Math.log10(p)));
    [mag / 1000, mag / 100, mag / 10, mag].forEach(function (step) {
      if (step < 0.01) step = 0.01; if (p >= 100 && step < 1) return;
      var lo = Math.floor(p * 0.85 / step), hi = Math.ceil(p * 1.15 / step);
      if (hi - lo > 4000) return;
      for (var k = Math.max(1, lo); k <= hi; k++) add(k * step, step < 1);
    });
    cands.sort(function (a, b) { return b.s - a.s; });
    var top = cands.slice(0, 8).sort(function (a, b) { return a.v - b.v; });
    box.innerHTML = '<h3>Lucky price points near ' + cur + " " + p.toLocaleString() + '</h3><div class="price-list">' + top.map(function (c) {
      var pct = ((c.v - p) / p * 100).toFixed(1);
      return "<div>" + cur + " " + (c.v === Math.round(c.v) ? c.v.toLocaleString() : c.v.toFixed(2)) + "<small>" + (pct > 0 ? "+" : "") + pct + "% · " + (c.v === Math.round(c.v) ? "whole-number lucky ending" : "lucky cents ending") + "</small></div>";
    }).join("") + '</div><p class="muted mt">Tip: in Chinese-speaking markets, endings in 8, 88, 168 and 888 signal prosperity; never let a 4 appear anywhere in a price, SKU or table number.</p>' +
      '<p><a class="btn btn-primary btn-sm" href="growth-desk.html?need=pricing">Get a full lucky-pricing strategy for my catalogue →</a></p>';
    box.classList.add("show");
  });

  /* Red envelope calculator */
  var LUCKY_AMTS = [6, 8, 10, 16, 18, 20, 26, 28, 30, 36, 38, 50, 58, 60, 66, 68, 80, 88, 100, 108, 128, 138, 168, 188, 200, 228, 238, 268, 288, 300, 328, 368, 388, 500, 518, 588, 600, 666, 688, 800, 888, 1000, 1088, 1288, 1688, 1888, 2000, 2288, 2688, 2888, 3888, 5888, 6666, 6888, 8888, 10000, 12888, 16888, 18888, 28888, 38888, 58888, 88888];
  var FUNERAL_AMTS = [11, 21, 31, 51, 71, 101, 151, 201, 301, 501, 1001, 2001];
  var OCC = {
    wedding: { b: 150, t: "Wedding gift (囍 — cover your meal cost at minimum; pairs are good)" },
    lny_kid: { b: 20, t: "Lunar New Year — children & unmarried juniors" },
    lny_parent: { b: 250, t: "Lunar New Year — parents & elders" },
    lny_staff: { b: 80, t: "Lunar New Year — staff bonus envelope (開工利是)" },
    birthday: { b: 80, t: "Elder's milestone birthday (壽)" },
    baby: { b: 60, t: "Baby full-month celebration (滿月)" },
    opening: { b: 160, t: "Business grand opening (開張大吉)" },
    graduation: { b: 80, t: "Graduation / new job" },
    funeral: { b: 50, t: "Funeral condolence (白金) — odd amounts, white envelope" }
  };
  var REL = { close: 1.6, relative: 1.25, friend: 1, colleague: 0.75, acquaint: 0.55 };
  var CURF = { USD: 1, CAD: 1.35, AUD: 1.5, SGD: 1.3, MYR: 4.4, HKD: 7.8, CNY: 7.1, GBP: 0.78, EUR: 0.9 };
  function snap(v, list) { var best = list[0]; list.forEach(function (x) { if (Math.abs(Math.log(x / v)) < Math.abs(Math.log(best / v))) best = x; }); return best; }
  var hf = $("#hongbao-form");
  if (hf) hf.addEventListener("submit", function (e) {
    e.preventDefault();
    var o = $('[name="occ"]', hf).value, r = $('[name="rel"]', hf).value, c = $('[name="cur"]', hf).value, box = $("#hongbao-result");
    var base = OCC[o].b * REL[r] * CURF[c], list = o === "funeral" ? FUNERAL_AMTS : LUCKY_AMTS;
    var low = snap(base * 0.7, list), mid = snap(base, list), high = snap(base * 1.5, list);
    box.innerHTML = "<h3>" + OCC[o].t + '</h3><div class="price-list"><div>' + c + " " + low + '<small>Modest</small></div><div style="border-color:var(--gold)">' + c + " " + mid + '<small>Recommended</small></div><div>' + c + " " + high + '<small>Generous</small></div></div>' +
      '<ul class="mt"><li>' + (o === "funeral" ? "Use a <b>white</b> envelope and an odd amount; never red." : "Use a <b>red</b> envelope with crisp new notes; even amounts are preferred.") + "</li><li>Never include a 4 (四 ≈ 死).</li><li>Hand it over with both hands; don't open it in front of the giver.</li></ul>" +
      '<p class="muted">Guidance reflects common diaspora norms; family and regional customs vary.</p>';
    box.classList.add("show");
  });

  /* Zodiac */
  var ANIMALS = [["Rat", "鼠", "🐀"], ["Ox", "牛", "🐂"], ["Tiger", "虎", "🐅"], ["Rabbit", "兔", "🐇"], ["Dragon", "龍", "🐉"], ["Snake", "蛇", "🐍"], ["Horse", "馬", "🐎"], ["Goat", "羊", "🐐"], ["Monkey", "猴", "🐒"], ["Rooster", "雞", "🐓"], ["Dog", "狗", "🐕"], ["Pig", "豬", "🐖"]];
  var ELEM = [["Wood", "木"], ["Wood", "木"], ["Fire", "火"], ["Fire", "火"], ["Earth", "土"], ["Earth", "土"], ["Metal", "金"], ["Metal", "金"], ["Water", "水"], ["Water", "水"]];
  var LNY = { 2020: "2020-01-25", 2021: "2021-02-12", 2022: "2022-02-01", 2023: "2023-01-22", 2024: "2024-02-10", 2025: "2025-01-29", 2026: "2026-02-17", 2027: "2027-02-06", 2028: "2028-01-26", 2029: "2029-02-13", 2030: "2030-02-03" };
  var lunarFmt = null; try { lunarFmt = new Intl.DateTimeFormat("en-u-ca-chinese", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Shanghai" }); } catch (e) {}
  function lunar(d) {
    var y = d.getFullYear(), iso = d.toISOString().slice(0, 10);
    if (LNY[y]) { var ly = iso >= LNY[y] ? y : y - 1; var info = lunarParts(d); if (info) info.year = ly; return info || { year: ly }; }
    var p = lunarParts(d); return p || { year: (d.getMonth() < 1 || (d.getMonth() === 1 && d.getDate() < 5)) ? y - 1 : y };
  }
  function lunarParts(d) {
    if (!lunarFmt) return null;
    try { var o = {}; lunarFmt.formatToParts(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 4))).forEach(function (x) { o[x.type] = x.value; });
      return { year: parseInt(o.relatedYear || o.year, 10), month: parseInt(o.month, 10), leap: /bis/.test(o.month || ""), day: parseInt(o.day, 10) }; } catch (e) { return null; }
  }
  var zf = $("#zodiac-form");
  if (zf) zf.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $('[name="dob"]', zf).value; if (!v) return toast("Pick your birth date");
    var d = new Date(v + "T12:00:00Z"), ly = lunar(d).year, a = ANIMALS[((ly - 4) % 12 + 12) % 12], el = ELEM[((ly - 4) % 10 + 10) % 10];
    $("#zodiac-result").innerHTML = '<div class="center"><div style="font-size:4rem">' + a[2] + '</div><h3>' + el[0] + " " + a[0] + ' <span class="kbd">' + el[1] + a[1] + '</span></h3><p class="muted">Lunar year ' + ly + " · born " + v + '</p></div>' +
      '<p>Your lucky-number profile: pair your sign with <b>8</b> (prosperity) and <b>6</b> (smooth flow) for business numbers. Check any number with the <a href="tools.html#analyzer">Lucky Number Analyzer</a>.</p><p class="muted">Born within a day of Lunar New Year? Confirm against a local almanac — the boundary follows the new moon in China Standard Time.</p>';
    $("#zodiac-result").classList.add("show");
  });

  /* Auspicious date scorer */
  var df = $("#date-form");
  if (df) {
    var now = new Date(); $('[name="month"]', df).value = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    df.addEventListener("submit", function (e) {
      e.preventDefault();
      var mv = $('[name="month"]', df).value, purpose = $('[name="purpose"]', df).value; if (!mv) return;
      var y = +mv.slice(0, 4), m = +mv.slice(5, 7), days = new Date(y, m, 0).getDate(), rows = [];
      for (var dd = 1; dd <= days; dd++) {
        var dt = new Date(Date.UTC(y, m - 1, dd, 12)), wd = dt.getUTCDay(), L = lunarParts(dt) || {}, s = 55, notes = [];
        var md = String(m) + String(dd); s += (analyze(md).score - 50) * 0.5;
        if (/8$/.test(String(dd))) { s += 8; notes.push("day ends in 8"); }
        if (/4/.test(String(dd))) { s -= 12; notes.push("contains 4"); }
        if (L.month === 7 && !L.leap) { s -= 25; notes.push("Ghost Month (lunar 7th)"); }
        var lnyS = LNY[y] ? new Date(LNY[y] + "T12:00:00Z").getTime() : null, dayIdx = lnyS ? Math.round((dt.getTime() - lnyS) / 864e5) : null;
        if (lnyS !== null ? (dayIdx >= 0 && dayIdx <= 14) : (L.month === 1 && L.day <= 15)) { s += 10; notes.push(dayIdx === 0 ? "Lunar New Year's Day" : "New Year period"); }
        if (L.month === 8 && L.day === 15) { s += 8; notes.push("Mid-Autumn"); }
        if (L.month === 7 && L.day === 7) { s += purpose === "wedding" ? 10 : 2; notes.push("Qixi"); }
        if (L.day === 1 || L.day === 15) { s += 3; notes.push("lunar " + (L.day === 1 ? "new" : "full") + " moon"); }
        if (m === 4 && dd >= 4 && dd <= 6) { s -= 18; notes.push("Qingming (tomb-sweeping)"); }
        if (purpose === "opening") { if (wd === 5 || wd === 6) { s += 5; notes.push("weekend foot traffic"); } }
        if (purpose === "wedding") { if (wd === 6) { s += 6; notes.push("Saturday"); } }
        if (purpose === "move" && (wd === 0 || wd === 6)) s += 3;
        rows.push({ d: dd, wd: wd, s: Math.max(1, Math.min(100, Math.round(s))), notes: notes, L: L });
      }
      var best = rows.slice().sort(function (a, b) { return b.s - a.s; }).slice(0, 5);
      var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
      var grid = '<div class="table-wrap"><table><thead><tr>' + names.map(function (n) { return "<th>" + n + "</th>"; }).join("") + "</tr></thead><tbody><tr>";
      for (var k = 0; k < first; k++) grid += "<td></td>";
      rows.forEach(function (r, idx) {
        if ((first + idx) % 7 === 0 && idx) grid += "</tr><tr>";
        var col = r.s >= 75 ? "var(--jade)" : r.s >= 55 ? "#b07b00" : "var(--red)";
        grid += '<td title="' + r.notes.join(", ") + '"><b>' + r.d + '</b><br><span style="color:' + col + ';font-weight:800">' + r.s + "</span>" + (r.L.month ? '<br><small class="muted">' + r.L.month + "/" + r.L.day + "</small>" : "") + "</td>";
      });
      grid += "</tr></tbody></table></div>";
      $("#date-result").innerHTML = "<h3>Top 5 dates</h3><ol>" + best.map(function (b) { return "<li><b>" + y + "-" + String(m).padStart(2, "0") + "-" + String(b.d).padStart(2, "0") + " (" + names[b.wd] + ")</b> — score " + b.s + (b.notes.length ? " · " + b.notes.join(", ") : "") + "</li>"; }).join("") + "</ol>" + grid +
        '<p class="muted mt">Small numbers under each date = Chinese lunar month/day. This is a cultural heuristic, not a full Tong Shu (通勝) almanac reading. For a personalised date based on the owners\' birth charts, <a href="growth-desk.html?need=launch-date">book a date-selection review</a>.</p>';
      $("#date-result").classList.add("show");
    });
  }

  /* Numeric domain / phone valuator */
  var vf = $("#value-form");
  if (vf) vf.addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = $('[name="asset"]', vf).value.trim(), type = $('[name="type"]', vf).value, n = raw.replace(/\D/g, ""), box = $("#value-result");
    if (!n) return toast("Enter a numeric domain, phone or plate");
    var r = analyze(n), len = n.length, tier, pts = [];
    var base = type === "domain" ? (len <= 3 ? 95 : len === 4 ? 82 : len === 5 ? 70 : len === 6 ? 58 : 40) : (len <= 4 ? 85 : len <= 6 ? 65 : 50);
    var v = base * 0.55 + r.score * 0.45;
    if (n.indexOf("4") > -1) { v -= 12; pts.push("Contains 4 — Chinese buyers discount heavily"); }
    if (/^(\d)\1+$/.test(n)) { v += 15; pts.push("Repdigit — top liquidity"); }
    if (/(\d)\1{2,}/.test(n)) { v += 5; pts.push("Triple+ repetition"); }
    if (n[0] === "0") { v -= 6; pts.push("Leading zero is less memorable"); }
    if (/\.com$/i.test(raw)) { v += 4; pts.push(".com — the liquid extension for numeric names"); }
    v = Math.max(1, Math.min(100, Math.round(v)));
    tier = v >= 85 ? "Premium" : v >= 70 ? "Strong" : v >= 55 ? "Standard" : "Speculative";
    box.innerHTML = '<div class="grid g2"><div class="center"><div class="score-ring" style="--p:' + v + '"><div>' + v + '</div></div><h3>' + tier + ' tier</h3><p class="muted">' + raw + '</p></div><div><h4>Signals</h4><ul><li>Length: ' + len + ' digits</li><li>Luck score: ' + r.score + '</li>' + pts.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>' +
      '<p class="muted">Rule-based tier only — not a price quote or financial advice.</p><a class="btn btn-primary btn-sm" href="growth-desk.html?need=numeric-asset&n=' + encodeURIComponent(raw) + '">Get a free human appraisal →</a></div></div>';
    box.classList.add("show");
  });

  /* Prefill Growth Desk from query */
  var gd = $("#lead-form");
  if (gd) {
    var qp = new URLSearchParams(location.search), need = qp.get("need"), num = qp.get("n");
    if (need) { var map = { "number-audit": "Lucky number / brand audit", pricing: "Lucky pricing strategy", "launch-date": "Opening / launch date", "numeric-asset": "Numeric domain / phone / plate", campaign: "Festival campaign plan" };
      $$('[data-chipgroup="needs"] .chip', gd).forEach(function (c) { if (c.textContent.trim() === map[need]) c.click(); }); }
    if (num) { var ta = $('[name="details"]', gd); if (ta) ta.value = "Number / asset to review: " + num + "\n"; }
  }

  /* Year in footer */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
