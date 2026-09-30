/* 738888.com — central monetization & integration config.
   Edit values here; every page reads from window.SITE. */
window.SITE = {
  name: "738888.com",
  tagline: "Rise & Prosper — 起·生·發發發發",
  interestUrl: "https://web.works/contact",

  // Contact route (encoded — never paste a plain address anywhere in this site)
  _r: [122,120,116,57,123,126,118,122,112,87,38,118,100,124,101,120,96,117,114,96],

  // Google AdSense — replace with your publisher ID (ca-pub-XXXXXXXXXXXXXXXX) once approved.
  adsense: { client: "", slots: { top: "", inContent: "", sidebar: "", footer: "" }, autoAds: true },

  // Analytics (optional) — e.g. "G-XXXXXXXXXX"
  ga4: "",

  // YouTube videos (IDs). Replace with your own channel videos as they go live.
  youtubeChannel: "https://www.youtube.com/results?search_query=chinese+lucky+numbers",
  videos: [
    { id: "kRgmrGHeJIc", title: "Why 8 is the luckiest number in Chinese culture" },
    { id: "sr673iAqLZY", title: "Meanings behind Chinese numbers — which are lucky?" },
    { id: "TlXIin_7uh0", title: "Why 8, 88 and 168 bring prosperity" },
    { id: "wf13M4MoHS4", title: "Chinese lucky and unlucky numbers explained" },
    { id: "p1aXXPVPqIA", title: "Why is the number 8 considered lucky?" },
    { id: "jxKWegGb-3I", title: "Chinese lucky numbers and meanings" }
  ],

  // Donation / payment links — paste your live links (leave "" to route to the pledge form).
  pay: { paypal: "", buymeacoffee: "", kofi: "", stripe: "", patreon: "" },

  // Funding goals shown on /support.html (amounts in USD)
  funds: [
    { key: "ops",     name: "Operations & hosting",   goal: 1888, raised: 0 },
    { key: "promo",   name: "Promotion & marketing",   goal: 3888, raised: 0 },
    { key: "talent",  name: "Hiring talent",           goal: 8888, raised: 0 },
    { key: "prizes",  name: "Contests & prizes",       goal: 2888, raised: 0 }
  ],

  // Current contest
  contest: {
    title: "The 8888 Lucky Story Contest",
    closes: "2027-02-06T23:59:00-05:00",   // Lunar New Year 2027 (Year of the Goat)
    prizes: ["US$888 + feature", "US$388", "US$188", "8 × US$28 runner-up prizes"]
  },

  social: { youtube: "", instagram: "", tiktok: "", x: "", facebook: "", pinterest: "", wechat: "" }
};
