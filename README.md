# Institute of Sound

A premium futuristic global underground music culture platform — built with React, Vite, and React Router.

## Vision

Not a blog. A cinematic archive of underground, alternative, cinematic, and experimental music scenes.

## Tech Stack

- **React 19** + **Vite 8** + **TypeScript**
- **React Router DOM** — full routing
- **Tailwind CSS v4** — design system
- **Framer Motion** — UI animations
- **GSAP + ScrollTrigger** — scroll-driven effects
- **Lenis** — smooth scrolling

## Architecture

Content is **API-driven**, not hardcoded in components:

```
public/api/          → Mock JSON endpoints (swap for real backend)
src/api/             → fetch client + endpoint functions
src/types/           → Shared TypeScript interfaces
src/components/      → Reusable UI (cards, sections, effects)
src/pages/           → Route pages with lazy loading
```

Ready to connect: Node/Express, Supabase, Firebase, Strapi, or any headless CMS.

## Roles & Dashboards

| Role | What they do | Dashboard |
|------|----------------|-----------|
| **Artist** | Login, submit tracks (stream link + description) | `/artist/dashboard` |
| **Editor** | Review submission queue, approve/reject, write reviews & features | `/editor/dashboard` |

### Cloudinary (images)

1. Follow **[CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)**
2. Add `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET` to `.env`
3. Artist/editor uploads go to Cloudinary; site loads them via CDN (`f_auto`, `q_auto`, responsive widths)

### Supabase (production)

1. Follow **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**
2. Copy `.env.example` → `.env` with your project URL + anon key
3. Run `supabase/schema.sql` in the SQL Editor
4. Register at `/register` as Editor or Artist

Data lives in: `profiles`, `track_submissions`, `editorial_drafts` (with RLS).

### Local demo (no `.env`)

- Editor: `editor@ios.test` / `editor123`
- Artist: `artist@ios.test` / `artist123`
- Data in browser localStorage only

**Flow:** Artist submits → `pending` → Editor reviews → Approve/Reject + notes → Artist sees feedback.

## Routes

| Path | Page |
|------|------|
| `/` | Landing (all sections) |
| `/login` | Sign in |
| `/register` | Create artist or editor account |
| `/artist/dashboard` | Artist — submit tracks (protected) |
| `/editor/dashboard` | Editor — review queue + write (protected) |
| `/discover` | Artists |
| `/playlists` | Playlists |
| `/signals` | Culture signals |
| `/features` | Long-form editorials |
| `/community` | Movement + ranks |
| `/submissions` | Portal info / redirect if logged in |
| `/archive` | Manifesto + links |
| `/artist/:slug` | Artist detail |
| `/playlist/:slug` | Playlist detail |
| `/feature/:slug` | Feature detail |

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Connecting a Real Backend

1. Replace `API_BASE` in `src/api/client.ts` with your API URL
2. Map endpoints in `src/api/endpoints.ts` to real routes
3. Keep the same response shapes defined in `src/types/`

Mock data lives in `public/api/*.json` for local development.
