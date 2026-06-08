# Institute of Sound — Web (`instituteofsound-web`)

React/Vite UI for [instituteofsound.in](https://instituteofsound.in). Business logic and REST API live in the sibling repo **`instituteofsound-api`** (Express on Railway). Future clients: **`instituteofsound-mobile`**.

A premium futuristic global underground music culture platform — built with React, Vite, and React Router.

## Vision

Not a blog. A cinematic archive of underground, alternative, cinematic, and experimental music scenes.

## Full site documentation

Detailed local reference (routes, roles, every dashboard tab, components, community, academy, toolkit): **[docs/SITE_DOCUMENTATION.md](./docs/SITE_DOCUMENTATION.md)**

## Tech Stack

- **React 19** + **Vite 8** + **TypeScript**
- **React Router DOM** — full routing
- **Tailwind CSS v4** — design system
- **Framer Motion** — UI animations
- **GSAP + ScrollTrigger** — scroll-driven effects
- **Lenis** — smooth scrolling

## Architecture

Content is **API-driven** where possible; academy and tools are in-repo TypeScript modules:

```
public/api/          → Magazine JSON (homepage sections) + nav/footer config
src/api/             → fetch client + endpoint functions
src/lib/academy/     → Curriculum, quizzes, progress, lesson videos
src/lib/tools/       → Toolkit registry + tool logic
src/lib/nav/         → Nav groups + full toolkit dropdown (toolkitNav.ts)
src/pages/           → Route pages with lazy loading
```

Ready to connect: Supabase (auth, profiles, editorial), Cloudinary (media).

## Roles & Dashboards

| Role | What they do | Dashboard |
|------|----------------|-----------|
| **Artist** | Google login, band profile, submit tracks | `/artist/dashboard` |
| **Editor** | Review queue, publish reviews & features | `/editor/dashboard` |

### Cloudinary (images)

1. Follow **[CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)**
2. Add `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET` to `.env`

### Supabase (database + auth)

Supabase lives in **`instituteofsound-api`** only (schema, migrations, env keys). The web app calls the API — no Supabase client in web.

1. Follow **[../instituteofsound-api/SUPABASE_SETUP.md](../instituteofsound-api/SUPABASE_SETUP.md)**
2. Run migrations in `instituteofsound-api/supabase/migrations/` (002–072 in order)
3. Artists sign in at `/login` with Google (via API OAuth)

### Local demo (no `.env`)

- Editor: `editor@ios.test` / `editor123`
- Artist: `artist@ios.test` / `artist123`
- Data in browser localStorage only

## Navigation

- **Academy** and **Toolkit** use grouped dropdowns in the navbar (`src/lib/nav/groupLinks.ts`).
- **Toolkit** lists the hub plus all 16 tools from `src/lib/tools/registry.ts` via `buildToolkitNavLinks()` — not a single “Tools · LIVE” link.

## Routes

### Magazine & culture

| Path | Page |
|------|------|
| `/` | Landing (cover, trending, reviews, features, …) |
| `/discover` | Live artist profiles (Supabase) |
| `/playlists` | Playlists |
| `/signals` | Signals |
| `/features` | Editorial features |
| `/community` | Community |
| `/submissions` | Artist portal info |
| `/archive` | Manifesto + archive links |
| `/about` | About Institute of Sound |
| `/contact` | Contact (email + Instagram) |
| `/privacy` | Privacy policy |
| `/artist/:slug` | Artist profile |
| `/playlist/:slug` | Playlist detail |
| `/feature/:slug` | Feature article |

### Music Production Academy

| Path | Page |
|------|------|
| `/academy` | Hub — search lessons, continue where you left off |
| `/academy/production` | Production track |
| `/academy/mixing` | Mixing track |
| `/academy/mastering` | Mastering track |
| `/academy/recording` | Recording track |
| `/academy/genres` | Genre labs track |
| `/academy/ear-training` | Ear training track |
| `/academy/release` | Release & delivery track |
| `/academy/:track/:lesson` | Lesson (e.g. `/academy/mixing/m1-01`) |
| `/academy/quizzes` | Quiz hub |
| `/academy/quiz/:slug` | Track quiz |
| `/academy/ear-lab` | Interactive Ear Lab |
| `/academy/certificates` | Certificates hub |
| `/academy/certificate/:slug` | Printable certificate |

### Studio toolkit

| Path | Tool |
|------|------|
| `/tools` | Toolkit hub |
| `/tools/music-prompt` | Music Prompt Builder |
| `/tools/chords` | Chord Tool |
| `/tools/artist-name` | Artist Name Generator |
| `/tools/vocal-chain` | Vocal Chain Builder |
| `/tools/tuning` | Tuning Reference |
| `/tools/bpm` | BPM Calculator |
| `/tools/tap-tempo` | Tap Tempo |
| `/tools/spectrum` | Spectrum Analyzer |
| `/tools/clipping` | Clip Detector |
| `/tools/loudness` | Loudness Meter |
| `/tools/key-scale` | Key & Scale |
| `/tools/lyrics` | Lyric Helper |
| `/tools/setlist` | Setlist Planner |
| `/tools/audio-format` | Format Checker |
| `/tools/subgenre-tags` | Subgenre Tags |
| `/tools/export-checklist` | Export Checklist |

### Auth & dashboards

| Path | Page |
|------|------|
| `/login` | Artist Google sign-in |
| `/register` | Artist sign-up info |
| `/auth/callback` | OAuth callback |
| `/desk` | Editor desk login |
| `/editor/join` | Editor recruitment |
| `/editor/login` | Editor login |
| `/editor/apply` | Editor application (artists) |
| `/dashboard` | Role redirect |
| `/artist/dashboard` | Artist studio (protected) |
| `/editor/dashboard` | Editorial desk (protected) |

## Contact

- **Email:** iosinstituteofsound@gmail.com
- **Instagram:** [@instituteofsound_](https://www.instagram.com/instituteofsound_/)

Defined in `src/lib/site/contact.ts`.

## Commands

```bash
npm install
npm run dev          # http://localhost:5173 (proxy /api → instituteofsound-api)
npm run build        # runs sitemap generation + TypeScript + Vite
npm run ci           # typecheck + production build (same as CI)
npm run sitemap      # regenerate public/sitemap.xml
npm run preview
```

Start **`instituteofsound-api`** on port 4000 first — see repo root [README](../README.md).

## SEO

- Per-route meta via `RouteSeo` + `useSeo` on dynamic pages
- `public/sitemap.xml` (generated), `public/robots.txt`
- JSON-LD: Organization, WebSite, Article, Course, etc.

## Connecting a Real Backend

1. Set `VITE_SITE_URL` in production (e.g. `https://instituteofsound.in`)
2. Configure Supabase + Cloudinary per setup docs
3. Replace or extend `public/api/*.json` for homepage magazine sections when ready
