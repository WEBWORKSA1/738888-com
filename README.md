# 738888.com — Rise & Prosper (起·生·發發發發)

Free Chinese lucky-number tools and cultural intelligence for businesses and families: Lucky Number Analyzer, Lucky Price Engine, Red Envelope Calculator, Opening-Date Scorer, Zodiac Finder, Numeric Asset Tier, Festival Marketing Calendar — feeding the **Prosperity Growth Desk** lead funnel.

- Live (GitHub Pages): https://webworksa1.github.io/738888-com/
- Research & idea selection: [`docs/RESEARCH.md`](docs/RESEARCH.md)
- Phase-wise build prompt: [`docs/PROMPT.md`](docs/PROMPT.md)

## Structure
| Path | Purpose |
|---|---|
| `*.html` (root) | Pages. Edit content between `<!--body-->` and `<!--/body-->`; title/description/FAQ live in the `<!--src-meta-->` JSON |
| `tools-src/build.py` | Re-applies the shared head, top bar, header, footer to every page in place; regenerates sitemap + robots |
| `assets/js/config.js` | **All monetization switches**: AdSense ID & slots, GA4, YouTube IDs, donation links, fund goals, contest |
| `assets/js/app.js` | Tools engine, forms, consent, ads loader, video facade, countdowns |
| `assets/css/style.css` | Design system (light/dark) |

Rebuild after editing a page or the shared layout: `python3 tools-src/build.py` (new page: copy any page, change its src-meta and body, rebuild).

## Forms
All forms post via FormSubmit (AJAX). The destination inbox is stored encoded in `config.js` and decoded only at submit time — it never appears in HTML or rendered text. **The first submission triggers a one-time FormSubmit activation email — click "Activate" in that email.**

## Monetization checklist
1. AdSense: put publisher ID in `config.js` (`adsense.client`) and the `google-adsense-account` meta in `build.py`; add the line to `ads.txt`; set slot IDs. Ads load only after cookie consent.
2. Donations: paste PayPal / Buy Me a Coffee / Ko-fi / Stripe / Patreon links in `config.js` → `pay`. Empty links fall back to the pledge form.
3. YouTube: replace `videos` IDs with your own channel's videos.

## Custom domain
When DNS is ready: add a `CNAME` file containing `738888.com`, point A records to 185.199.108.153 / .109.153 / .110.153 / .111.153 and `www` CNAME to `webworksa1.github.io`, set `BASE` in `build.py` to `https://738888.com/`, rebuild, enable "Enforce HTTPS".

## Legal
"738888" is a number; no trademark is claimed in it. Not affiliated with any entity using the same digits. Original content © 738888.com.
