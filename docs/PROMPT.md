# 738888.com — Phase-Wise Build Prompt

Use each phase as a standalone prompt for an AI builder (Claude, Cursor, etc.) or a developer. Each phase lists **Goal → Build → Acceptance criteria**. Global rules apply to every phase.

---

## GLOBAL RULES (paste at the top of every phase)

```
Project: 738888.com — "Rise & Prosper" (起·生·發發發發)
Positioning: Free prosperity toolkit + knowledge hub for businesses and families who live in,
sell to, or celebrate Chinese culture. Tool-first, content-second, lead-gen always.
Stack: Static HTML5 + one CSS file + vanilla JS. No build server, no database.
Must deploy on GitHub Pages FREE plan (repo WEBWORKSA1/738888-com). All links RELATIVE
(site is served from /738888-com/ until the custom domain is pointed).
Design: modern, mobile-first, responsive (320px → 1440px+), light/dark theme toggle,
red (#c8102e) + gold (#d4a017) + ink (#14110f) palette, rounded cards, subtle motion,
prefers-reduced-motion respected, WCAG AA contrast, keyboard accessible.
Performance: no framework, lazy-load YouTube (click-to-play facade), system/Google fonts
only, Lighthouse ≥ 90 on all four scores.
SEO: unique <title>/<meta description>, canonical, Open Graph, Twitter card, JSON-LD
(Organization, WebSite, FAQPage, BreadcrumbList), sitemap.xml, robots.txt.
TOP BAR on EVERY page: "Contact, if you are interested in this website / domain name /
Sponsorship / Advertisement / Partnership" → https://web.works/contact (new tab).
EMAIL: The only contact address is the owner's inbox. It must NEVER appear in HTML, JS
strings, or rendered text. Store it obfuscated (char codes, XOR, reversed) and decode only
at submit/click time. All forms POST via FormSubmit AJAX to the decoded address.
LEGAL: No trademark/copyright claim over the number "738888". Numbers are not ownable;
the site claims only its own original content/design. Include trademark & copyright
disclosure, privacy, terms, cultural/financial disclaimer, affiliate & ad disclosure.
NO gambling, lottery-prediction, or guaranteed-luck claims (AdSense policy).
```

---

## PHASE 1 — Foundation, brand & shell
**Build**
1. Repo structure: `/index.html` + page files, `/assets/css/style.css`, `/assets/js/app.js`, `/assets/js/config.js`, `/assets/img/`, `/docs/`, `/tools-src/build.py`.
2. `build.py` templates a shared `<head>`, top bar, header/nav, footer into every page so the layout is static HTML (SEO-safe) but edited in one place.
3. Brand: SVG logo "738888" with 起生發 mark; favicon (SVG); OG image.
4. Header: logo, nav (Tools, Meaning, Calendar, Learn, Growth Desk, Contests, Support), theme toggle, mobile drawer.
5. Footer: 5 columns (Brand + newsletter, Tools, Learn, Work with us, Company), social links, disclosures, © line.
6. `config.js`: AdSense publisher ID, ad slot IDs, YouTube IDs, donation links (PayPal/BuyMeACoffee/Ko-fi/Stripe/Patreon), social URLs, contest dates — every monetization switch in one file.

**Accept when** every page shares identical chrome, top bar links to web.works/contact, grep for the inbox returns zero hits.

## PHASE 2 — Core interactive tools (traffic engine)
1. **Lucky Number Analyzer** — input any number (phone, plate, address, price, domain, date). Score 0–100 from digit weights (8=+10, 6=+7, 9=+6, 2=+4, 3=+3, 7=+2, 1=+1, 0=0, 5=−1, 4=−12), repetition bonus, known-combo bonus (88, 168, 518, 666, 888, 8888, 38, 1314, 520), 4-penalty, 14/74/94 penalty. Output: grade, per-digit Chinese character + meaning chips, combos found, suggested alternatives. Shareable URL (`?n=`).
2. **Lucky Price Engine** — enter a target price & currency; return nearest "lucky" price points (±15%, endings 8/88/68/188, cents for small prices), with "no-4" guarantee.
3. **Red Envelope (Hongbao) Calculator** — occasion × relationship × currency → modest / recommended / generous amounts snapped to lucky values (odd amounts + white envelope for funerals).
4. **Chinese Zodiac Finder** — birth date → animal + element using the Chinese lunar calendar (Intl `ca-chinese`) with a verified Lunar New Year override table.
5. **Auspicious Opening-Date Scorer** — scores each date in a chosen month: date-digit luck, weekday preference by purpose, festival boosts, flags Qingming and Ghost Month; shows calendar grid with lunar dates and top 5 dates.
6. **Numeric Domain / Phone / Plate Tier (lead magnet)** — rule-based tier (Premium/Strong/Standard/Speculative) + "Get a free human appraisal" CTA → Growth Desk.

**Accept when** all tools work in-browser with no server, have share/CTA buttons, and each tool section has explanatory content + FAQ schema.

## PHASE 3 — Content hub (SEO depth)
1. **/meaning.html** — pillar page "What does 738888 mean?" with digit table, economic evidence table (plates, phone numbers, domains, Olympics), people/behaviour section, sources.
2. **/learn.html** — digits 0–9, lucky/unlucky combos, business etiquette, plus YouTube video library (facade embeds).
3. **/calendar.html** — Chinese Shopping & Festival Marketing Calendar (Double 11, Double 12, Lunar New Year, Lantern, 520, 618, Dragon Boat, Qixi, Mid-Autumn, Golden Week) with countdowns, campaign angles and "Plan my campaign" CTA.
4. Future: article template with TOC, author box, reading time, related posts, in-article ad slots.

**Accept when** each pillar page has H1/H2 hierarchy, FAQ JSON-LD, internal links to tools, and ≥1 CTA to the Growth Desk.

## PHASE 4 — Lead generation: "Prosperity Growth Desk"
1. Dedicated landing page `/growth-desk.html` with benefit hero, 6 service cards (Lucky Number Audit, Lucky pricing strategy, Grand-opening date selection, Numeric asset acquisition, Festival campaign plans, Chinese market entry).
2. **Multi-step form** (3 steps, progress bar): (1) needs chips + budget + timeline, (2) business profile (company, website, industry, market, details), (3) contact (name, email, phone/WhatsApp, WeChat, consent). Hidden context: UTM source/medium/campaign, landing page, page URL.
3. Client-side lead scoring (budget, timeline, completeness) shown in email subject as `[HOT]/[WARM]/[COLD]`.
4. Exit-intent + 60% scroll slide-in offering a "Free Lucky Number Audit".
5. Inline CTAs after every tool result that prefill the Growth Desk form (`?need=…&n=…`).
6. Honeypot + time-to-submit anti-spam; FormSubmit `_template: table`.

**Accept when** a test submission from every form arrives in the owner inbox and the address is never in source.

## PHASE 5 — Monetization layer
1. **Google AdSense**: `ads.txt`, `<meta name="google-adsense-account">`, manual units (under hero, in-content after tools, sticky sidebar on desktop). Reserve space to avoid CLS. Load only after consent.
2. **YouTube**: video library, click-to-load facade (thumbnail from i.ytimg.com), youtube-nocookie player.
3. **Sponsorship & Advertising** `/advertise.html`: placements (tool sponsor "Powered by", top bar/homepage, newsletter slot, contest title sponsor, festival calendar sponsor, partnerships), media-kit inquiry form.
4. **Affiliate slots**: feng shui products, Chinese-learning apps, domain registrars, travel — each with rel="sponsored" and disclosure.
5. **Premium (future)**: PDF audit reports, API for the analyzer.

## PHASE 6 — Community & support engine
1. **Support page** `/support.html`: one-tap amounts (8, 18, 38, 88, 188, 888), monthly tiers ("Rise" $3, "Grow" $8, "Prosper" $28, "Patron 8888" $88), goal bars per fund — Operations, Promotion & Marketing, Hiring Talent, Contests & Prizes — supporter wall, pledge form, payment buttons driven by config.
2. **Contests** `/contests.html`: current contest hero with countdown, prize ladder (US$888 / 388 / 188 + 8 × 28), entry form, bonus entry actions (share, subscribe, refer), official rules (no purchase necessary, skill-testing question for Canada, Quebec note), winners hall, upcoming contests.
3. **Careers** `/careers.html`: open roles (bilingual content writer, short-form video creator, SEO, community moderator, partnerships, city ambassadors), application form.

## PHASE 7 — Trust, legal & compliance
Pages: About, Contact, Privacy (GDPR/PIPEDA/Law 25/CCPA, cookies, AdSense third-party vendor language), Terms, Disclaimer & Trademark/Copyright Disclosure, Contest Official Rules. Cookie consent banner with Accept/Reject that gates ad and analytics scripts. 404 page with tool shortcuts.

## PHASE 8 — Performance, SEO & launch
1. sitemap.xml, robots.txt, canonical, JSON-LD validation; future hreflang (zh-Hans/zh-Hant).
2. Push to GitHub `WEBWORKSA1/738888-com` (branch `main`) and publish via GitHub Pages (`gh-pages` branch or Settings → Pages → Deploy from branch `main` / root).
3. When DNS is ready: add `CNAME` file = `738888.com`, A records 185.199.108.153 / 109.153 / 110.153 / 111.153 and `www` CNAME → `webworksa1.github.io`; switch `BASE` in build.py; enable HTTPS.
4. Submit to Google Search Console + Bing; apply for AdSense after 20–30 quality pages.

## PHASE 9 — Growth & expansion roadmap
- zh-Hans / zh-Hant versions (doubles addressable search).
- Weekly "Lucky Dates" newsletter + YouTube Shorts from each tool result.
- Numeric Asset Market Watch (monthly price report: plates, phones, domains) — backlink magnet.
- Directory of feng-shui consultants / Chinese-market agencies (paid listings).
- Embeddable widgets ("Powered by 738888.com") for backlinks; partner API.
- Annual "Prosper Awards" contest with sponsor pool.
