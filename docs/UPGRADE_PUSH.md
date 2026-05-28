# V2 shell upgrade — push instructions

Branch: **`upgrade/v2-shell`** on `instituteofsound` (v1 repo).

## What changed

- New **AppShell** (sidebar, top bar, mobile tabs, ⌘K palette) replaces old `Layout` / top navbar chrome.
- V2 **home layout** + **editorial API merge** (published drafts on `/features` and `/feature/:slug`).
- **Super editor**, full **artist studio**, **Supabase migrations** — unchanged (still v1 code).
- `ios_v2` folder = dev sandbox; **production target is this repo**.

## Push (you only)

```bash
cd /Users/admin/Downloads/instituteofsound
git status
git push -u origin upgrade/v2-shell
```

Then open a PR: `upgrade/v2-shell` → `main`, or merge after Vercel preview looks good.

## Preview locally

```bash
cd /Users/admin/Downloads/instituteofsound
npm install
npm run dev
```

Same `.env` as before (Supabase, Cloudinary).

## After merge to main

- Vercel production deploys from `main` as usual.
- No database migration required for this PR (UI + endpoints merge only).

## Still on roadmap (not this PR)

- Super editor extra tabs (already in v1 `EditorDashboardPage` — keep using v1 editor account / Google desk).
- Optional: fold remaining `ios_v2` tweaks back in small follow-up PRs.
