# AGENTS.md — vedifyastro-web

Next.js 14 (App Router, plain JS) website for VedifyAstro. It replaces the old static site that lived in
`zodiacaii/frontend/index.html` + `frontend/vedify-web/`. Built on the same base as the Shukto/OPC frontend.

## Commands
```bash
npm install
npm run dev              # http://localhost:3000  (copy .env.example to .env.local first)
npm run build && npm start
npm run lint
npm run optimize-images  # one-off: PNG avatars in public/agents -> small WebP
```

## Architecture
- `/api/*` is **proxied** to the Node backend by `next.config.js` rewrites (`BACKEND_URL`, server-side). The
  browser never calls the backend directly, so no CORS setup is needed. AI calls get a 180 s proxy timeout.
- `site.config.js`: brand, SEO, nav, footer, languages.
- `lib/agents.js`: the single registry of all 17 AI agents. `key` matches the backend prompt/specialist type.
- `lib/pricing.js`: wallet bonus tiers **mirror** backend `walletController.calculateVAPoints`. The backend is the
  source of truth for what is credited; keep both in sync.
- Theme: colours in `tailwind.config.js` (`cosmos`, `gold`, `ink`) come from the old site's `tokens.css`.
  Fonts: Syne (display) + Manrope (body) via `next/font`.
- Motion: framer-motion. Respect `prefers-reduced-motion` (handled globally in `globals.css`).

## Content rules
- Agents are **AI personas**: always label them as AI; never show invented experience years or order counts.
- Sample data in the UI phase is marked with a visible "sample"/"demo" badge.
- Astrology is guidance, not medical/legal/financial advice — keep the footer disclaimer.

## Deployment
- Railway service built from `Dockerfile` (standalone output). Runtime env: `BACKEND_URL`.
  Build args: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
- Old URLs (e.g. the Play Store's `/vedify-web/html/delete-account.html`) are redirected in `next.config.js`.
- Do not remove the old static site from `zodiacaii` until vedifyastro.com points at this service.

## Build phases
0 setup · 1 UI/UX (all pages, sample data) · 2 auth + onboarding · 3 astrology core · 4 wallet + Razorpay ·
5 AI agents one by one (+ voice) · 6 SEO, analytics, cutover.
