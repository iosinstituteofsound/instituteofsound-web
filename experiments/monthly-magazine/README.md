# Monthly magazine (isolated — demo gate)

**Status:** On hold until product owner approves a demo. Do not wire into production IOS until then.

## Not the same as

- Reviews (`/reviews`)
- Features / editor articles (`/features`, editorial desk)
- Homepage magazine JSON (`public/api/`)

Those stay as-is. This line is **monthly issues**: subscribe → PDF + EPUB download.

## Isolation rules (until approved)

| Do | Don't |
|----|--------|
| Work only under `experiments/monthly-magazine/` | Add routes in `src/App.tsx` |
| Own Vite app / scripts when demo starts | Import from `src/` into main build |
| Own Supabase migration prefix when ready (e.g. `060-monthly-magazine-*.sql`) | Touch `editorial_drafts`, reviews, or discover |
| Document in this README | Merge nav/sidebar with Features or Reviews |

## After demo approval

1. Move UI + `lib/` into `src/` (or keep subdomain — product call).
2. Apply migrations to hosted Supabase.
3. Add nav entry, Stripe (if paid), member library.

## How to view the demo

From repo root:

```bash
npm run dev:magazine
```

Open **http://localhost:5200** — dark catalog, tap an issue, try **Download PDF** / **Download EPUB** (sample files only).

**Port already in use?** Stop the old server, then retry:

```bash
lsof -ti :5200 | xargs kill -9
npm run dev:magazine
```

Production build preview:

```bash
npm run preview:magazine
```

Main app (`npm run dev`) does **not** include this.

Delete this folder anytime if the product is cancelled.
