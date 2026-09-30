#!/usr/bin/env python3
"""Static site builder for 738888.com.
Edit the page body between <!--body--> and <!--/body--> in any root *.html file
(and its <!--src-meta--> JSON for title/description/FAQ), then run the builder to
re-apply the shared layout. (Legacy: tools-src/pages/*.html with a meta comment:)
<!--meta {"title": "...", "desc": "...", "nav": "tools", "faq": [["Q","A"], ...]} -->
The builder wraps body content with the shared head, top bar, header, footer and
writes the final HTML to the repo root. Run:  python3 tools-src/build.py
"""
import json, re, pathlib, html, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tools-src" / "pages"
# Canonical base. Switch to "https://738888.com/" once the domain's DNS points to GitHub Pages.
BASE = "https://webworksa1.github.io/738888-com/"
VERSION = datetime.date.today().strftime("%Y%m%d")

NAV = [("tools", "tools.html", "Tools"), ("meaning", "meaning.html", "Meaning"),
       ("calendar", "calendar.html", "Calendar"), ("learn", "learn.html", "Learn"),
       ("growth", "growth-desk.html", "Growth Desk"), ("contests", "contests.html", "Contests"),
       ("support", "support.html", "Support")]

TOPBAR = ('<div class="topbar" role="note">Contact, if you are interested in this '
          '<a href="https://web.works/contact" target="_blank" rel="noopener">website / domain name / '
          'Sponsorship / Advertisement / Partnership</a> →</div>')

def header(active):
    cur = ' aria-current="page"'
    items = "".join(
        '<li><a href="%s"%s>%s</a></li>' % (href, cur if key == active else "", label)
        for key, href, label in NAV)
    return f'''<a class="skip" href="#main">Skip to content</a>
{TOPBAR}
<header class="site-header"><div class="container nav">
<a class="logo" href="index.html" aria-label="738888.com home"><span class="mark" aria-hidden="true">發</span><span>738888<small>Rise · Grow · Prosper</small></span></a>
<nav aria-label="Main"><ul class="menu" id="menu">{items}</ul></nav>
<div class="nav-actions"><a class="btn btn-primary btn-sm" href="growth-desk.html">Free Audit</a>
<button class="icon-btn theme-toggle" aria-label="Toggle dark mode">☾</button>
<button class="icon-btn burger" aria-label="Open menu" aria-controls="menu" aria-expanded="false">☰</button></div>
</div></header>'''

FOOTER = '''<footer class="site-footer"><div class="container">
<div class="foot-grid">
<div><a class="logo" href="index.html" style="color:#fff"><span class="mark">發</span><span>738888.com<small style="color:#c9b9a8">起 · 生 · 發發發發</small></span></a>
<p style="margin-top:14px;font-size:.93rem">Free prosperity tools and cultural intelligence for businesses and families who live in, sell to, or celebrate Chinese culture.</p>
<form data-form="newsletter" data-subject="Newsletter signup" data-ok="Subscribed — your first Lucky Dates brief is on its way." class="foot-news" novalidate>
<label class="sr" for="nl-email">Email</label><input id="nl-email" type="email" name="email" placeholder="Your email" required>
<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off"><button class="btn btn-gold btn-sm" type="submit">Join</button><div class="form-msg" role="status"></div></form>
<p style="font-size:.78rem;margin-top:6px">Weekly lucky dates & festival marketing brief. Unsubscribe anytime.</p></div>
<div><h4>Tools</h4><ul><li><a href="tools.html#analyzer">Lucky Number Analyzer</a></li><li><a href="tools.html#price">Lucky Price Engine</a></li><li><a href="tools.html#hongbao">Red Envelope Calculator</a></li><li><a href="tools.html#dates">Opening-Date Scorer</a></li><li><a href="tools.html#zodiac">Zodiac Finder</a></li><li><a href="tools.html#value">Numeric Asset Tier</a></li></ul></div>
<div><h4>Learn</h4><ul><li><a href="meaning.html">What 738888 means</a></li><li><a href="learn.html">Number meanings 0–9</a></li><li><a href="calendar.html">Festival marketing calendar</a></li><li><a href="learn.html#videos">Video library</a></li></ul></div>
<div><h4>Work with us</h4><ul><li><a href="growth-desk.html">Prosperity Growth Desk</a></li><li><a href="advertise.html">Advertise & sponsor</a></li><li><a href="contests.html">Contests & prizes</a></li><li><a href="careers.html">Careers & ambassadors</a></li><li><a href="support.html">Support / donate</a></li><li><a href="https://web.works/contact" target="_blank" rel="noopener">Buy / partner on this domain</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li><li><a href="disclaimer.html">Disclaimer & trademark</a></li><li><a href="sitemap.xml">Sitemap</a></li></ul></div>
</div>
<div class="legal-note"><p><b>Trademark & copyright disclosure:</b> "738888" is a number and is not claimed as a trademark by this site. No affiliation with any company, product, lottery, or brand that uses the same or similar digits is implied. All trademarks belong to their respective owners. Original text, design and code © <span data-year></span> 738888.com. Cultural readings are traditional folk beliefs shared for education and entertainment — not financial, legal, or medical advice. This site may display ads and affiliate links; see our <a href="disclaimer.html">disclosures</a>.</p></div>
</div></footer>
<div class="cookie" role="dialog" aria-label="Cookie consent"><p>We use cookies for analytics and to show ads (Google AdSense) that keep our tools free. You can accept or reject non-essential cookies. <a href="privacy.html">Privacy</a></p><div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm cookie-yes">Accept</button><button class="btn btn-ghost btn-sm cookie-no">Reject</button></div></div>
<aside class="slidein" aria-label="Free audit offer"><button class="x" aria-label="Close">×</button><span class="tag gold">Free · 2 minutes</span><h3 style="margin-top:8px">Get a free Lucky Number Audit</h3><p class="muted" style="font-size:.9rem">Send us your business phone, address or price list. A specialist replies with a luck score and fixes.</p>
<form data-form="audit" data-subject="Free Lucky Number Audit request"><input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off"><div class="field"><input type="email" name="email" placeholder="Email" required aria-label="Email"></div><div class="field"><input name="number" placeholder="Number(s) to audit" aria-label="Number to audit" required></div><button class="btn btn-primary btn-block" type="submit">Send my audit request</button><div class="form-msg" role="status"></div></form></aside>
<script src="assets/js/config.js?v=VER"></script><script src="assets/js/app.js?v=VER" defer></script>'''

ORG = {"@context": "https://schema.org", "@graph": [
    {"@type": "Organization", "name": "738888.com", "url": BASE, "logo": BASE + "assets/img/logo.svg",
     "slogan": "Rise · Grow · Prosper"},
    {"@type": "WebSite", "name": "738888.com — Rise & Prosper", "url": BASE}]}

def page(meta, body, fname):
    title = meta["title"]; desc = meta["desc"]; url = BASE + ("" if fname == "index.html" else fname)
    ld = [ORG]
    if meta.get("faq"):
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in meta["faq"]]})
    if fname != "index.html":
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": meta.get("crumb", title.split("—")[0].strip()), "item": url}]})
    faq_html = ""
    if meta.get("faq"):
        faq_html = '<section id="faq"><div class="container prose" style="margin:0 auto"><h2>Frequently asked questions</h2>' + "".join(
            f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in meta["faq"]) + "</div></section>"
    robots = '<meta name="robots" content="noindex">' if fname == "404.html" else '<meta name="robots" content="index,follow,max-image-preview:large">'
    return f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
{robots}
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#c8102e">
<meta property="og:type" content="website"><meta property="og:site_name" content="738888.com"><meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image">
<!-- Google AdSense site verification: replace with your publisher ID once approved -->
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Serif+SC:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v={VERSION}">
<script>try{{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}}catch(e){{}}</script>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body>
{header(meta.get("nav", ""))}
<main id="main">
<!--src-meta {json.dumps(meta, ensure_ascii=False)} -->
<!--body-->{body}<!--/body-->
{faq_html}
</main>
{FOOTER.replace("VER", VERSION)}
</body></html>
'''

def main():
    urls = []
    # Source of truth: tools-src/pages/*.html if present, otherwise the built pages in the repo root
    # (each built page carries its own <!--src-meta--> and <!--body--> markers, so it can be rebuilt in place).
    files = sorted(SRC.glob("*.html")) if SRC.exists() else sorted(p for p in ROOT.glob("*.html"))
    for f in files:
        raw = f.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--meta\s*(\{.*?\})\s*-->", raw, re.S)
        if m:
            meta = json.loads(m.group(1)); body = raw[m.end():]
        else:
            mm = re.search(r"<!--src-meta (\{.*?\}) -->", raw, re.S)
            if not mm: continue
            meta = json.loads(mm.group(1)); body = raw.split("<!--body-->", 1)[1].split("<!--/body-->", 1)[0]
        (ROOT / f.name).write_text(page(meta, body, f.name), encoding="utf-8")
        if f.name != "404.html":
            urls.append(BASE + ("" if f.name == "index.html" else f.name))
        print("built", f.name)
    today = datetime.date.today().isoformat()
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
        f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n"
    (ROOT / "sitemap.xml").write_text(sm, encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n", encoding="utf-8")

if __name__ == "__main__":
    main()
