# Institute of Sound — V2 Work Pipeline

> **Goal:** Same product as v1 (nothing removed), new skeleton (mockups), v1 fonts/colors/premium feel.  
> **Repo:** `ios_v2` · **Reference:** `instituteofsound` (v1)

---

## Principles (non-negotiable)

| Rule | Detail |
|------|--------|
| Feature parity | v1 capabilities all return — cut nothing |
| New skeleton | Fixed shell: sidebar + top bar + main + right rail (desktop); drawer + bottom tabs (mobile) |
| Academy + Toolkit | Public for everyone (guest included), free, SEO-friendly URLs |
| Education | No paywall on learning |
| Auth UI | Sidebar/options change by **role** + member **persona** — not separate apps |
| Data | Start with v1 `public/api` + port `src/lib` / Supabase when ready |

---

## Phase 0 — Foundation ✅ (done)

- [x] `ios_v2` Vite + React + TS + Tailwind v4
- [x] Copy v1 `public/api/*.json`
- [x] V1 design tokens in `src/index.css` (buttons, cards, badges, hero, grain)
- [x] `AppShell` — sidebar, top bar, right rail, mobile drawer + 5 tabs
- [x] **Home page** — mockup layout + v1 content/API
- [x] Placeholder routes for linked pages

**Exit:** Home loads, looks premium, links exist (stubs OK).

---

## Phase 1 — App shell lock ✅

**Objective:** One consistent chrome everywhere before page flood.

| Task | Notes |
|------|--------|
| `route → mode` map | ✅ `src/lib/nav/routeModes.ts` |
| Active nav + section title | ✅ Top bar + mobile header via `ShellContext` |
| Global search UI | ✅ `⌘K` `CommandPalette` |
| Guest top bar | ✅ Stub avatar until Phase 4 |
| Responsive breakpoints | ✅ Same as Phase 0 |
| Shared primitives | ✅ `LoadingTransmission`, `MagazineSectionHeading`, `MetalBadge` |
| SEO base | ✅ `RouteSeo`, `staticRoutes`, `useSeo` |
| Stub pages | ✅ `PageShell` on all routes |

**Exit:** Navigate any stub route — same shell, no layout jump.

---

## Phase 2 — Public “Read” layer (magazine) ✅

**Objective:** Guest-canonical magazine + SEO (no login walls).

| Page | v1 source |
|------|-----------|
| `/features` | `FeaturesPage` + API |
| `/feature/:slug` | `FeatureDetailPage` + editorial merge |
| `/signals` | `SignalsPage` |
| `/playlists` | `PlaylistsPage` |
| `/playlist/:slug` | `PlaylistDetailPage` |
| `/discover` | `DiscoverPage` (static first, Supabase when env) |
| `/artist/:slug` | `ArtistProfilePageView` |
| `/artist/:slug/epk` | EPK |
| `/release/:slug` | `ReleaseDetailPage` |
| `/scenes`, `/scenes/:city/:genre` | Scene index + hub |
| `/events` | `EventsIndexPage` |
| `/collab` | `CollabBoardPage` |
| `/about`, `/contact`, `/privacy`, `/archive` | Static/legal |
| `/submissions` | Marketing portal |

| Cross-cutting | |
|---------------|--|
| Home polish | Reviews block, trending, community CTA if needed |
| Sitemap script | All public URLs including academy/tools |
| JSON-LD | Article, WebSite, Organization |

**Exit:** Guest can browse full magazine/network surface; Google-indexable HTML per route.

**Done in v2:**
- [x] All Phase 2 routes wired (no `PageShell` stubs on read/network URLs above)
- [x] Static API: `events.json`, `collab.json`, `releases.json` + release slugs on home
- [x] Scene registry + 80 scene hub URLs
- [x] Community (guest browse), EPK (print-ready from archive), release detail
- [x] `npm run sitemap` → `public/sitemap.xml` (101 public URLs)
- [ ] Supabase-backed feeds/RSVP/collab composer → Phase 4–6

---

## Phase 3 — Academy + Toolkit (public “Learn” + “Make”) ✅

**Objective:** Tabs map to real product; free + SEO.

| Area | Work |
|------|------|
| `/academy` | Hub — `src/lib/academy` from v1 |
| Tracks + lessons | `/academy/:track`, `/academy/:track/:lesson` |
| Quizzes, ear lab, certificates | All v1 routes |
| `/tools` | Hub + registry |
| 16 tools | Port `src/pages/tools/*` + `src/lib/tools/*` |
| Progress | Local first; optional login for sync (`AcademyProgressSync`) |
| Nav | Sidebar groups + mobile Learn/Make tabs |

**Exit:** All academy/tool URLs work without login; sign-in only for save/sync.

**Done in v2:** v1 `lib/academy`, `lib/tools`, all pages + 16 tools, local progress, `academy-tools.css`, lazy routes.

---

## Phase 4 — Auth + onboarding 🟡

**Objective:** Signup → correct dashboard + sidebar.

| Task | Notes |
|------|--------|
| Supabase setup | `.env`, migrations from v1 `supabase/migrations` |
| `AuthContext` | Port v1 auth |
| `/register`, `/login`, `/auth/callback` | Google OAuth |
| `/dashboard` redirect | `homeDashboardPath(role)` priority |
| Member persona picker | promoter / manager / label / brand → dashboard variant |
| `/member/upgrade` | → artist role |
| `/editor/apply` + approval | → editor role |
| Protected routes | Dashboards only where needed |
| Local demo mode | No `.env` → `editor@ios.test` / `artist@ios.test` |

**Exit:** User signs up → sees listener dashboard; upgrade/apply changes role UI.

**Done in v2:** `AuthProvider`, local demo login (`member` / `artist` / `editor` @ `ios.test`), Google when Supabase env set, protected routes, auth pages.

---

## Phase 5 — Role dashboards (mockup skins) 🟡

**Objective:** Same shell, role-specific sidebar block + Home tab content.

| Dashboard | Mockup ref | v1 base |
|-----------|------------|---------|
| Listener / Member | Rhian | `MemberDashboardPage` + persona variants |
| Artist | Void Chapter | `ArtistDashboardPage` |
| Artist Manager | Aarav | Persona = promoter/manager |
| Label | Void Records | Persona = label |
| Brand | Nike India | Persona = brand |
| Editor | Arjun | `EditorDashboardPage` |
| Super Editor | Raven | Extra tabs: analytics, verification, applications |

| Shared widgets | Quick actions, stats strip, tasks, calendar shells |
|----------------|------------------------------------------------------|

**Exit:** Each role lands on correct dashboard; sidebar “Role desk” matches role.

**Done in v2:** Shell dashboards per role + member persona picker (skin). Artist submit/history + editor queue/write/publish wired in Phase 7.

---

## Phase 6 — Community + network ✅

**Objective:** “Network” tab + community features behind auth where needed.

| Feature | |
|---------|--|
| `/community` | Feed, tribes, crews, challenges |
| `/network/:handle` | Member profile |
| Follow, notifications | Bell in top bar |
| dB, ranks, badges | Gamification UI |
| Post composer | Login required |
| Read-only preview | Optional for guests (SEO: community landing public) |

**Exit:** Logged-in community loop works; feed post requires auth.

**Done in v2:**
- [x] Full `/community` — wire highlights, feed + filters, composer (auth), tribes, crews, challenges, leaderboards
- [x] `/network/:handle` — member profile (feed, signal log, medals, academy tab)
- [x] Notifications bell in top bar (`NetworkNotificationsPanel`)
- [x] Local demo: feed seed, dB, badges, follow, notifications without Supabase
- [x] Guest browse + sign-in CTA for posting

---

## Phase 7 — Artist studio + editorial desk (workflows) ✅

**Objective:** Submit → review → publish pipeline.

| Stream | |
|--------|--|
| Artist | Submit track, submission history, network hub tab |
| Editor | Queue, approve/reject, write editorial (TipTap), drafts, publish |
| Magazine merge | `mergeFeaturesWithPublished`, `getPublishedFeatureBySlug`, reviews + cover story |
| Member upgrade | `upgradeToArtist` → artist dashboard |
| Cloudinary | `ImageUpload` with URL fallback when env unset |

**Deferred to Supabase / later:** Full `ArtistProfileEditor`, `ReleaseEditor`, super-editor tabs (wire, applications, analytics).

**Exit:** End-to-end: artist submits → editor publishes → appears on `/features`, `/feature/:slug`, homepage cover.

**Done in v2:**
- [x] `lib/submissions`, `lib/editorial/published`, TipTap editor components
- [x] `ArtistDashboardPage` — submit + history + lifecycle timeline
- [x] `EditorDashboardPage` — queue, TipTap write, drafts, publish (local + Supabase paths)
- [x] `MemberUpgradeArtistPage` — member → artist role
- [x] `src/dashboard-studio.css` — artist desk + RTE + lifecycle styles
- [x] API endpoints merge published editorials into static JSON

**Local E2E:** `artist@ios.test` / `artist123` → submit · `editor@ios.test` / `editor123` → approve → write feature → publish → refresh `/features`.

---

## Phase 8 — PWA, performance, polish

| Task | |
|------|--|
| `vite-plugin-pwa` | Manifest, icons from v1 scripts |
| Standalone mode | Bottom tabs always visible |
| `lenis` / `framer` / `gsap` | Selective port (hero/marketing only if perf OK) |
| `data-perf=lite` | Reduce motion on weak devices |
| Lighthouse + Core Web Vitals | |
| Accessibility pass | Focus, contrast, labels |

**Exit:** Installable PWA; acceptable perf on mid phones.

---

## Phase 9 — Production cutover

| Task | |
|------|--|
| `VITE_SITE_URL`, Vercel | |
| Env secrets | Supabase, Cloudinary |
| Replace/static merge | `public/api` vs live editorial |
| DNS | `instituteofsound.in` → v2 or parallel preview |
| Analytics / error monitoring | Optional |
| Redirect map | v1 URLs → v2 if any path changes |

**Exit:** Production serves v2; v1 repo archived or frozen.

---

## Suggested order (timeline view)

```
Phase 0 ✅
    ↓
Phase 1  Shell lock          (~2–3 days)
    ↓
Phase 2  Public Read         (~1–2 weeks)
    ↓
Phase 3  Academy + Toolkit   (~1 week)     ← parallel SEO win
    ↓
Phase 4  Auth                (~3–5 days)
    ↓
Phase 5  Dashboards          (~1–2 weeks)
    ↓
Phase 6  Community           (~1 week)
    ↓
Phase 7  Workflows           (~1–2 weeks)
    ↓
Phase 8  PWA + polish        (~3–5 days)
    ↓
Phase 9  Launch
```

Phases 2 + 3 can overlap after Phase 1. Phase 4 before 5–7 is required.

---

## Current status

| Phase | Status |
|-------|--------|
| 0 | ✅ Done |
| 1 | ✅ Done |
| 2 | 🟡 In progress (core magazine live) |
| 3–9 | ⏳ Planned |

---

## Phase 2 progress

| Route | Status |
|-------|--------|
| `/features`, `/feature/:slug` | ✅ Live + SEO |
| `/signals` | ✅ Live |
| `/playlists`, `/playlist/:slug` | ✅ Live + SEO |
| `/discover` | ✅ Live (static `artists.json`) |
| `/artist/:slug` | ✅ Live (archive JSON; full studio Phase 4+) |
| `/about`, `/contact`, `/privacy`, `/archive`, `/submissions` | ✅ Live |
| `/editor/join` | ✅ Live |
| Scenes, events, collab, community… | ⏳ Still `PageShell` stub |

---

## Next action (Phase 2 continued)

1. `ArtistDetailPage` (static + later Supabase).  
2. `About`, `Contact`, `Submissions`, `Archive`.  
3. Reviews block on home (optional).

---

*Updated: May 2026*
