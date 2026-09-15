# DF360 × Apex MD — df360.apexmd.com

Static partner microsite for Defined Fitness. Edit the `*.html` files directly; there is no build step.

- **Deploy:** Vercel, auto-deploying from `main`. Repo root is the site root.
- **Brand tokens:** `df360-theme.css` (`:root`). DF360 red is `#DE192C` deep /
  `#FF3B4A` bright-on-dark; product pages use Apex MD red `#E02424` / `#C50806`.
- **Intake:** `https://formdefined.apexmd.com/?categoryId=<cat>` —
  `weight-loss | microdosing | trt | hrt | longevity | bloodwork`.
- **Affiliate:** iDevAffiliate id **176** (`api/track.js`), fired by `affiliate.js`.
- **Copy rule:** Apex MD is NOT bundled into Defined Fitness membership. Use
  "Defined Fitness has partnered with…" / "exclusive member access".
  Never "included with your membership".
