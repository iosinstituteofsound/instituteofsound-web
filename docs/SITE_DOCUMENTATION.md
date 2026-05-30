# Institute of Sound — Site Documentation

> **Local reference only.** Describes the full product: routes, roles, dashboards, components, and data flow.  
> Last updated: May 2026 (API v1 on Vercel, artist page lifecycle/recovery, playlist curator, build notes) · Repo: `instituteofsound`

---

## Table of contents

1. [What this site is](#1-what-this-site-is)
2. [Tech stack](#2-tech-stack)
3. [Repository layout](#3-repository-layout)
4. [User roles & authentication](#4-user-roles--authentication)
5. [App shell & navigation](#5-app-shell--navigation)
6. [All routes (URL map)](#6-all-routes-url-map)
7. [Dashboards (detailed)](#7-dashboards-detailed)
8. [Public pages & magazine](#8-public-pages--magazine)
9. [Community & network](#9-community--network)
10. [Artist profiles & releases](#10-artist-profiles--releases)
11. [Editorial desk](#11-editorial-desk)
12. [Music Production Academy](#12-music-production-academy)
13. [Studio toolkit (16 tools)](#13-studio-toolkit-16-tools)
14. [Scenes, events & collab](#14-scenes-events--collab)
15. [Component library (by folder)](#15-component-library-by-folder)
16. [Data & backend](#16-data--backend) (includes [API v1](#164-api-v1-vercel))
17. [PWA & install](#17-pwa--install)
18. [Environment variables & scripts](#18-environment-variables--scripts)
19. [SEO & contact](#19-seo--contact)

---

## 1. What this site is

**Institute of Sound (IOS)** is an underground music culture platform combining:

- A **magazine** (features, reviews, signals, playlists, cover stories)
- A **network** (community feed, tribes, crews, dB ranks, follows)
- **Artist studios** (public band pages, releases, editor submissions)
- An **editorial desk** (track review queue, publish reviews/features)
- **Academy** (lessons, quizzes, ear lab, certificates)
- **Toolkit** (16 browser-based production helpers)

Design language: black/red editorial chrome, display typography, grain overlay, metal badges.

---

## 2. Tech stack

| Layer | Technology |
|--------|------------|
| UI | React 19, TypeScript, Vite 8 |
| Routing | React Router DOM 7 (lazy-loaded pages) |
| Styling | Tailwind CSS v4 + `src/index.css` design tokens |
| Motion | Framer Motion, GSAP + ScrollTrigger, Lenis smooth scroll |
| Auth & DB | Supabase (Google OAuth, profiles, community, editorial) |
| Media | Cloudinary (image uploads) |
| Rich text | TipTap (editorial write tab) |
| PWA | `vite-plugin-pwa` (manifest, service worker, install prompt) |

---

## 3. Repository layout

```
instituteofsound/
├── docs/                    ← This file
├── public/
│   ├── api/                 ← Static JSON for homepage magazine sections + nav/footer
│   ├── pwa/                 ← App icons (PNG + SVG master)
│   ├── sitemap.xml          ← Generated at build
│   └── favicon.svg
├── scripts/
│   ├── generate-pwa-icons.mjs
│   └── generate-sitemap.mjs
├── api/                     ← Vercel serverless (see [§16.4](#164-api-v1-vercel))
│   ├── v1/[...path].ts      ← Single catch-all for all /api/v1/* (Hobby 12-fn limit)
│   ├── _lib/v1Router.ts     ← Route dispatch + shared handlers
│   ├── link-preview.ts, thumbnail.ts, import-catalog.ts, share/, og/
├── supabase/migrations/     ← PostgreSQL schema (001–063+)
├── src/
│   ├── App.tsx              ← All routes
│   ├── main.tsx             ← Providers, mount
│   ├── api/                 ← `v1Client.ts`, `v1Fallback.ts`, static endpoint fetchers
│   ├── components/          ← UI by domain (layout, community, dashboard, …)
│   ├── context/             ← AuthContext
│   ├── hooks/               ← Data hooks (community, content, academy, …)
│   ├── lib/                 ← Business logic (auth, community, academy, tools, …)
│   ├── pages/               ← Route-level pages
│   └── types/               ← Shared TS types
├── index.html
├── vite.config.ts
└── .env                     ← Secrets (not committed)
```

---

## 4. User roles & authentication

### Roles (`src/lib/auth/types.ts`)

| Role | Code | Default sign-up | Home after login |
|------|------|-----------------|------------------|
| **Member** | `member` | Yes (Google `/register`) | `/member/dashboard` |
| **Artist** | `artist` | Via member upgrade or legacy artist signup | `/artist/dashboard` |
| **Editor** | `editor` | Desk login / approved application | `/editor/dashboard` |
| **Super Editor** | `super_editor` | Assigned in DB | `/editor/dashboard` (extra tabs) |

### Auth entry points

| URL | Purpose |
|-----|---------|
| `/register` | Join with Google → new **member** |
| `/login` | Artist/member Google sign-in |
| `/auth/callback` | OAuth redirect handler |
| `/desk` | Editor desk login (email/password) |
| `/editor/login` | Editor login |
| `/editor/join` | Editor programme info |
| `/editor/apply` | Members/artists apply to become editors (protected) |
| `/dashboard` | Redirects to role-appropriate dashboard |

### Auth modes

- **Supabase (production):** Real users, cloud sync, RLS policies.
- **Local demo (no `.env`):** `editor@ios.test` / `artist@ios.test` — data in `localStorage` only.

### Protected routes

`src/components/auth/ProtectedRoute.tsx` wraps dashboard routes and checks `user.role`.

### Member persona (workspace type)

Stored on profile as `dashboardPersona` (migration `043-member-dashboard-persona.sql`):

- `event_promoter` — Events & scenes focus  
- `artist_manager` — Artist growth & editorial routing  
- `label` — Roster & release calendar  
- `brand` — Campaign & scene partnerships  

Chosen on **Member Dashboard**; personalizes priorities, workflow, and quick links.

---

## 5. App shell & navigation

### V2 shell (`src/components/layout/AppShell.tsx`)

`App.tsx` wraps all routes in **`AppShell`** (not the legacy `Layout.tsx` / `Navbar.tsx` pair).

| Piece | File | Role |
|-------|------|------|
| Desktop nav | `Sidebar.tsx` | Fixed left rail — Discover, Editorial, Toolkit, Academy, Access, role desk link |
| Top bar | `TopBar.tsx` | Section title, search trigger, notifications, identity (desktop) |
| Mobile | `MobileNav.tsx` | Bottom tabs + drawer (same `Sidebar` tree) |
| Search | `CommandPalette.tsx` | `⌘K` / `Ctrl+K` quick jump |
| Context | `ShellContext.tsx` | Active section title, route mode |
| Chrome | `RouteSeo`, `GrainOverlay`, `AcademyProgressSync` | SEO + grain on main scroll area |

Styles: `src/app-shell.css` · Route modes: `src/lib/nav/routeModes.ts`

**Inside dashboards:** pages use **`RoleDeskLayout`** (see [§7.0](#70-shared-desk-shell-roledesklayout)) — a second, role-specific sidebar *within* the main content column. Site shell = global IOS nav; desk shell = queue / studio / workspace tabs.

### Legacy (unused in `App.tsx`)

`Layout.tsx`, `Navbar.tsx`, `Footer.tsx` remain in the repo from v1 but are **not mounted**. Do not document their behavior as live unless re-wired.

### Sidebar nav groups (`src/lib/nav/groupLinks.ts`)

- **Discover** — Home, Discover, Scenes, Events, …  
- **Editorial** — Features, Signals, Archive, …  
- **Toolkit** — Hub + all 16 tools  
- **Academy** — Hub, quizzes, ear lab, certificates  
- **Access** — Login, Register, Dashboard links (role-aware)

### Key layout components

| File | Role |
|------|------|
| `Sidebar.tsx` | Global V2 navigation |
| `TopBar.tsx` | Desktop header + notifications |
| `MobileNav.tsx` | Mobile drawer + bottom tabs |
| `NavUserIdentity.tsx` | Avatar, dashboard links, logout (where used) |
| `ArtistNavActions.tsx` | Join / editor CTAs (legacy navbar) |

---

## 6. All routes (URL map)

### Magazine & culture (public)

| Path | Page file | What it is |
|------|-----------|------------|
| `/` | `HomePage.tsx` | Cover story, trending, reviews, features, playlists, signals |
| `/discover` | `DiscoverPage.tsx` | **Wire index** — 9 scroll sections (editorial → community); guest gate for deep links |
| `/releases` | `ReleasesPage.tsx` | Full published-studio catalog (tracks + albums + premieres); filters by release type |
| `/playlists` | `PlaylistsPage.tsx` | Playlist index |
| `/playlist/:slug` | `PlaylistDetailPage.tsx` | Single playlist |
| `/signals` | `SignalsPage.tsx` | Short “signal” transmissions |
| `/features` | `FeaturesPage.tsx` | Long-form features list |
| `/feature/:slug` | `FeatureDetailPage.tsx` | Feature article |
| `/release/:slug` | `ReleaseDetailPage.tsx` | Release detail |
| `/archive` | `ArchivePage.tsx` | Manifesto + archive links |
| `/about` | `AboutPage.tsx` | About IOS |
| `/contact` | `ContactPage.tsx` | Email + Instagram |
| `/privacy` | `PrivacyPage.tsx` | Privacy policy |
| `/submissions` | `SubmissionsPage.tsx` | How to submit tracks (marketing) |

### Artists

| Path | Page | What it is |
|------|------|------------|
| `/artist/:slug` | `ArtistDetailPage.tsx` | Public artist site (hero, tracks, merch, story) |
| `/artist/:slug/epk` | `ArtistEpkPage.tsx` | Electronic press kit view |

### Community & network

| Path | Page | What it is |
|------|------|------------|
| `/feed` | `FeedPage.tsx` | Primary social feed (composer, filters, load more) |
| `/feed/:postId` | `FeedPostPage.tsx` | Single post + threaded comments (shareable URL) |
| `/community` | `CommunityPage.tsx` | Hub: tribes, leaderboard, embedded feed (`#feed`) |
| `/network/:handle` | `CommunityMemberPage.tsx` | Public member profile (posts, medals, follow) |

### Scenes, events, collab

| Path | Page | What it is |
|------|------|------------|
| `/scenes` | `ScenesIndexPage.tsx` | City × genre scene index |
| `/scenes/:city/:genre` | `SceneHubPage.tsx` | Scene hub (releases, artists) |
| `/events` | `EventsIndexPage.tsx` | Event board + RSVP |
| `/collab` | `CollabBoardPage.tsx` | Need/offer collaboration board |

### Academy

| Path | Page |
|------|------|
| `/academy` | `AcademyHubPage.tsx` — tracks, progress, search |
| `/academy/:track` | `AcademyTrackPage.tsx` — e.g. `production`, `mixing` |
| `/academy/:track/:lesson` | `AcademyLessonPage.tsx` — lesson content + videos |
| `/academy/quizzes` | `AcademyQuizzesHubPage.tsx` |
| `/academy/quiz/:quiz` | `AcademyQuizPage.tsx` |
| `/academy/ear-lab` | `AcademyEarLabPage.tsx` — frequency game |
| `/academy/certificates` | `AcademyCertificatesPage.tsx` |
| `/academy/certificate/:cert` | `AcademyCertificatePage.tsx` — printable |

### Toolkit (16 tools)

| Path | Tool |
|------|------|
| `/tools` | Hub |
| `/tools/music-prompt` | Music Prompt Builder |
| `/tools/chords` | Chord Progression Generator |
| `/tools/artist-name` | Artist Name Generator |
| `/tools/vocal-chain` | Vocal Chain Builder |
| `/tools/tuning` | Tuning Reference |
| `/tools/bpm` | BPM Finder (Web Audio) |
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

Registry: `src/lib/tools/registry.ts` · Pages: `src/pages/tools/*`

### Auth & dashboards (protected where noted)

| Path | Access | Page |
|------|--------|------|
| `/member/dashboard` | Member | `MemberDashboardPage.tsx` |
| `/member/upgrade` | Member | `MemberUpgradeArtistPage.tsx` |
| `/artist/dashboard` | Artist | `ArtistDashboardPage.tsx` |
| `/editor/dashboard` | Editor, Super Editor | `EditorDashboardPage.tsx` |

---

## 7. Dashboards (detailed)

All dashboards share the **V2 desk shell** ([§7.0](#70-shared-desk-shell-roledesklayout)) inside the global `AppShell`.

### 7.0 Shared desk shell (`RoleDeskLayout`)

**Files**

| File | Role |
|------|------|
| `src/components/dashboard/RoleDeskLayout.tsx` | Generic desk: header, identity, quick strip, grouped sidebar, content |
| `src/components/dashboard/SuperEditorDeskLayout.tsx` | Super-editor nav groups + pipeline quick tiles (wraps `RoleDeskLayout`) |
| `src/dashboard-studio.css` | `.editor-dashboard`, `.desk-*` (aliases keep `.super-editor-*` for compat) |

**Desk anatomy (top → bottom)**

1. **Header** — kicker (optional “· live cloud” when Supabase), title, summary, avatar + name/email + `MetalBadge`, actions (`headerExtra` per role + Network feed / Site / Logout).
2. **Quick strip** — up to four metric tiles; clickable tiles call `onTabChange` for the relevant section.
3. **Body** — left **sidebar nav** (grouped labels + optional count badges); right **content** pane for the active tab.

**Responsive:** Below `1024px`, sidebar nav becomes a two-column button grid; sidebar sticks on desktop.

| Role | Page | Wrapper | `rootClassName` |
|------|------|---------|-----------------|
| Member | `MemberDashboardPage` | `RoleDeskLayout` | `member-desk` |
| Artist | `ArtistDashboardPage` | `RoleDeskLayout` | `artist-desk` |
| Editor | `EditorDashboardPage` | `RoleDeskLayout` | `editor-desk` |
| Super Editor | `EditorDashboardPage` | `SuperEditorDeskLayout` | `super-editor-dashboard` |
| Member upgrade | `MemberUpgradeArtistPage` | `RoleDeskLayout` | `member-upgrade-desk` |

---

### 7.1 Member Dashboard — `/member/dashboard`

**File:** `src/pages/dashboard/MemberDashboardPage.tsx`  
**Shell:** `RoleDeskLayout` · Badge: **Member**

#### Desk sidebar tabs

| Tab ID | Nav label | Contents |
|--------|-----------|----------|
| `workspace` | Workspace home | Persona picker (first visit) **or** active persona panel (priorities, workflow, toolkit, quick links, reset) + `MemberTrustPanel` |
| `grow` | Upgrade paths | Artist path → `/member/upgrade` · Editorial path → `/editor/apply`, `/editor/join` |
| `explore` | Explore IOS | Scenes, Events, Collab, Discover cards |
| `network` | Feed & activity | `DashboardCommunityHub` — dB, feed link, collab skills |

#### Quick strip
Workspace status (Setup / Live), active role name, Explore shortcut, Feed shortcut.

#### Header extra
Public profile → `/network/:handle`

#### Workspace personas (modal on pick)
User picks one of four personas (modal explains role + capabilities):

| Persona | Focus |
|---------|--------|
| Event Promoter | Events, RSVPs, scenes, collab crew |
| Artist Manager | Releases, editorial submit, collab |
| Label | Roster, release calendar, scene promotion |
| Brand | Scene hubs, campaigns, events |

Stored as `dashboardPersona` on profile. **Reset** clears persona and returns to picker (workspace tab).

---

### 7.2 Artist Dashboard — `/artist/dashboard`

**File:** `src/pages/dashboard/ArtistDashboardPage.tsx`  
**Shell:** `RoleDeskLayout` · Badge: **Artist** (live)

**Purpose:** **My Studio** — public artist page, releases, editor submissions.

#### Desk sidebar (group: Studio)

| Tab ID | Label | Contents |
|--------|-------|----------|
| `network` | Network | `DashboardCommunityHub` |
| `profile` | Your page | `ArtistProfileEditor` |
| `releases` | Releases | `ReleaseEditor` |
| `submit` | Submit to editors | Track submission form |
| `history` | Submissions | List + `SubmissionLifecycleTimeline` (nav badge = submission count) |

**Submit to editors** (`submit` tab) posts to Supabase table `track_submissions` via `src/lib/submissions/service.ts` (direct client insert today — **not** `/api/v1`). Artwork uses Cloudinary folder `ios/submissions`. If you see `Request failed (404)` with `VITE_USE_V1_API=true`, that usually means a **dashboard refresh** called `/api/v1/*` (profile or recovery) while the v1 route was missing on Vercel — not the submission insert itself. After deploy, verify: `curl -sL -o /dev/null -w "%{http_code}" https://instituteofsound.in/api/v1/me` → expect **401** (route exists, auth required).

#### Quick strip
Submissions total, pending, approved, **Next step** → profile tab.

#### Header extra
Discover · Public page (when slug exists) → `/artist/:slug`

#### Artist profile editor (inside `profile` tab)

Built from `src/components/dashboard/ArtistProfileEditor.tsx` and related panels:

| Component | What it edits |
|-----------|----------------|
| `ArtistProfileSectionNav` | Section jump nav |
| `ArtistBrandingPanel` | Colors, logo, hero layout |
| `ArtistBioTimelineEditor` | Bio + timeline |
| `ArtistMediaEditors` | Photos, videos |
| `ArtistSocialOrderEditor` | Social link order |
| `ArtistMerchEditor` | Merch items |
| `ArtistPressKitEditor` | Press kit PDF/links |
| `ArtistCatalogImport` | YouTube/catalog import |
| `ArtistProfileAnalytics` | Profile view stats |
| `ArtistProfileQrCard` | QR to public page |

Public result: `/artist/:slug`

---

### 7.3 Editor Dashboard — `/editor/dashboard`

**File:** `src/pages/dashboard/EditorDashboardPage.tsx`  
**Purpose:** Review submissions, write/publish editorial, wire picks, events.

#### Regular editor — `RoleDeskLayout` · Badge: **Editor**

**Sidebar — Editorial desk**

| Tab ID | Label | Component / function |
|--------|-------|----------------------|
| `queue` | Submission queue | Filters: pending / in_review / approved / rejected; review panel, approve/reject, wire suggestion on approve |
| `wire` | Wire picks | `DiscoverPremierePicksPanel` (Discover §03 premieres) + `EditorWirePicksPanel` (feed spins for editorial) |
| `write` | Write editorial | TipTap draft form (types, cover, embeds, artist link, homepage flag) |
| `drafts` | My drafts | List → publish to site (nav badge = draft count) |
| `events` | Events board | `EditorEventsPanel` |

**Sidebar — Your account**

| Tab ID | Label | Component |
|--------|-------|-----------|
| `network` | Network & feed | `DashboardCommunityHub` |
| `profile` | Editor profile | `EditorProfilePanel` |

**Quick strip:** Pending, In review, Drafts, Approved (accent).

**Header extra:** Magazine → `/features`

Horizontal pill tabs were removed; navigation is sidebar-only (same pattern as other desks).

#### Super editor — `SuperEditorDeskLayout` · Badge: **Super editor** (live)

Adds **Command** group before editorial desk:

| Tab ID | Label | Component |
|--------|-------|-----------|
| `analytics` | Overview | `SuperAdminAnalytics` — role counts, clickable user lists |
| `preview` | Dashboard preview | `SuperEditorDashboardPreview` |
| `verification` | Verification queue | `SuperEditorVerificationPanel` — role verification + relationship claims |
| `applications` | Editor applications | `EditorApplicationsPanel` |
| `playlist_curators` | Playlist curators | `SuperEditorPlaylistCuratorPanel` — review curator applications (`060`) |
| `deleted_pages` | Deleted artist pages | `SuperEditorDeletedPagesPanel` — archive + recovery requests (`063`) |

**IOS Support** = super editor role in UI copy; DB role remains `super_editor`.

Editorial desk + account groups match the regular editor. **Quick strip** adds pipeline label tile (Backlog / Active / Clear).

#### Submission workflow
1. Artist submits from Artist Dashboard  
2. Editor opens queue → **Mark in review**  
3. **Approve** or **Reject** with notes  
4. Approved tracks can feed editorial/wire flows  
5. **Publish draft** → live on `/feature/:slug` or review pages  

---

### 7.4 Dashboard redirect — `/dashboard`

**File:** `DashboardRedirectPage.tsx`  
Sends user to `homeDashboardPath(role)` from `src/lib/auth/roles.ts`.

---

### 7.5 Member → Artist upgrade — `/member/upgrade`

**File:** `src/pages/dashboard/MemberUpgradeArtistPage.tsx`  
**Shell:** `RoleDeskLayout` · Badge: **Upgrade**

Single nav item **Launch studio**; form collects display name + optional slug → `upgradeToArtist()` → redirect `/artist/dashboard`.

**Header extra:** Member desk → `/member/dashboard`

---

## 8. Public pages & magazine

### Homepage sections (`HomePage.tsx`)

| Section component | Data source | Content |
|-------------------|-------------|---------|
| `CoverHeroSection` | `getCoverStory()` | Main cover feature |
| `TrendingRail` | `getTrending()` | Trending items |
| `BandSpotlightSection` | `getArtists()` | Band spotlight |
| `ReviewsBlock` | `getReviews()` | Reviews |
| `AlbumArtRow` | `getAlbumReleases()` | Album art row |
| `EditorialMagazineGrid` | `getFeatures()` | Features grid |
| `PlaylistSection` | `getPlaylists()` | Playlists |
| `SignalsSection` | `getSignals()` | Signals |
| `CommunitySection` | — | CTA to community |
| `SubmissionSection` | — | CTA to join/submit |

Static magazine JSON: `public/api/*.json` · Fetched via `src/api/endpoints.ts`.

### Discover wire (`/discover`)

**Page:** `DiscoverPage.tsx` · Shell: `discover-wire` (`max-width: 1200px`) · Styles: `src/styles/discover.css` (+ per-section CSS imported in `src/index.css`)

**Purpose:** Single long-form **Explore / Wire index** — magazine-style sections with red/black IOS chrome, sticky jump rail, and gated deep links (`GatedLink` + login gate for guests).

| Piece | File | Role |
|-------|------|------|
| Guest CTA | `DiscoverGuestBanner` | Sign-in prompt when logged out |
| Intro + rail | `DiscoverPageIntro` | “Explore” title + sticky `#discover-*` jump links (01–09) |
| Barrel exports | `DiscoverSections.tsx` | Re-exports section components + shared intro/banner |

**Shared layout tokens** (`discover.css` on `.discover-wire`):

- Section padding: `1.75rem` top / `2.5rem` bottom (last section `2rem`, no bottom border)
- Header → content gap: `1.35rem`
- Section scroll margin: `6rem` (sticky top bar clearance)

#### Wire sections (order on page)

| # | Anchor ID | Component | Styles | Data / notes |
|---|-----------|-----------|--------|----------------|
| 01 | `#discover-editorial` | `DiscoverEditorialSection` | `editorial-desk.css` | `getFeatures()` — desk picks grid |
| 02 | `#discover-artists` | `DiscoverArtistsSection` | `roster-pro.css` | `listDiscoverArtists()` — carousel roster |
| 03 | `#discover-releases` | `DiscoverReleasesSection` | `releases-premieres.css` | `useDiscoverPremieres()` — premiere cards, filters, “View all” → `/releases` |
| 04 | `#discover-labels` | `DiscoverLabelsSection` | `labels-imprints.css` | Curated labels / imprints |
| 05 | `#discover-playlists` | `DiscoverPlaylistsSection` | `playlists-curated.css`, `playlists-featured.css` | `getPlaylists()` — featured + list |
| 06 | `#discover-scenes` | `DiscoverScenesSection` | `scene-hubs.css` | `listDiscoverScenes()` — city mosaic + stats |
| 07 | `#discover-events` | `DiscoverEventsSection` | `events-wire.css` | `listDiscoverEvents()` — RSVP tiles + submit CTA |
| 08 | `#discover-listeners` | `DiscoverListenersSection` | `listeners-operators.css` | `listDiscoverListeners()` — top 5 + trending + network dB |
| 09 | `#discover-community` | `DiscoverCommunitySection` | `community-wire.css` | `useDiscoverPulse()` — tribes, spin carousel, crews |

#### Discovery data layer (`src/lib/discovery/`)

| Module | Used by | Responsibility |
|--------|---------|----------------|
| `premieres.ts` | §03, editor picks | `fetchDiscoverPremiereFeed`, hourly `hour_bucket`, editor picks CRUD, search for desk |
| `releasesCatalog.ts` | `/releases` | `fetchReleasesCatalog` — all published studio tracks, albums, live/scheduled premieres |
| `listeners.ts` | §08 | Weekly leaderboard merge + showcase fallback |
| `communityPulse.ts` | §09 | Tribe/spin/crew showcase merge for empty Supabase |
| `events.ts` | §07 | Event cards + API/fallback gigs |
| `scenes.ts` | §06 | Scene hub tiles (verified Unsplash IDs) |
| `playlists.ts` | §05 | Curated playlist metadata |
| `labels.ts` | §04 | Label imprint cards |

#### Premieres system (Explore §03)

- **DB:** `discover_premiere_picks` + RPC `discover_premiere_feed` — migration **`059-discover-premiere-picks.sql`**
- **Rotation:** UTC hour bucket; client hook `useDiscoverPremieres` refetches when the hour rolls
- **Editor desk:** `DiscoverPremierePicksPanel` on **Wire picks** tab — search track, set badge (`wire_pick` / `hot` / `new`)
- **Cards link to:** `/artist/:slug` (artist profile stream)

#### `/releases` catalog (menu → Releases)

**Product rule:** When an artist **publishes** their studio (`artist_profiles.published`) and adds material in My Studio, it must appear on `/releases`.

| Source | Artist action | On `/releases` |
|--------|---------------|----------------|
| `artist_tracks` | Music → add track / quick add | One card per track |
| `artist_albums` | Discography → album / EP / single | One card per release (shows track count when linked) |
| `artist_releases` | Dashboard → Releases → schedule or go live | Premiere + tracklist rows (`status` live or scheduled only; not draft) |

- **Hook:** `useReleasesCatalog` → `fetchReleasesCatalog` in `releasesCatalog.ts` (not the hourly premiere RPC)
- **UI:** `ReleasesPage.tsx` + same `prem-*` cards as Explore §03
- **Links:** tracks/albums → `/artist/:slug`; premiere rows → `/release/:slug` when applicable

#### §08 Listeners & §09 Community (mock-aligned UI)

- **Listeners:** Hero #1 + four narrow rank cards; footer bar = trending 6–10 + total network dB (showcase when leaderboard RPC empty)
- **Community:** Three columns — trending tribes (monthly war), top spins carousel (vinyl + waveform), top crews + hero image
- **CTAs:** `#genre-board`, `#feed`, `#crew-wars-heading` on `/community`
- No verified-checkmark badges on operator pills (role text only)

#### Supporting discover components

`FeaturedPlaylistCard`, `PlaylistCover`, `SceneHubCover` — cover helpers (direct Unsplash load where Cloudinary fetch would 404).

---

## 9. Community & network

### Routes

| URL | Page | Role |
|-----|------|------|
| `/feed` | `FeedPage.tsx` | Main feed UI (logged-in wire + global filters) |
| `/feed/:postId` | `FeedPostPage.tsx` | Permalink for one post + comment thread |
| `/community` | `CommunityPage.tsx` | Full community hub (same `CommunityFeed` at `#feed`) |
| `/network/:handle` | `CommunityMemberPage.tsx` | Operator profile |

Home `/` stays the magazine landing; social activity lives on **`/feed`**.

### Community hub (`/community`)

**Page:** `CommunityPage.tsx`

| Block | Component | Purpose |
|-------|-----------|---------|
| Spin of the week | `SpinOfTheWeekHero` | Featured spin |
| Friday wire | `FridayWireBanner` | Wire CTA |
| Tribe spotlight | `TribeSpotlight` | Genre tribe highlight |
| Tribe war | `TribeWarSeason` | Seasonal tribe competition |
| Wire digest | `WireDigestPanel` | Wire summaries |
| Rank ladder | Rank cards | Listener → Operator ranks |
| Progress | `CommunityProgressCard` | Your dB (if logged in) |
| Leaderboards | `CommunityLeaderboard`, `CommunityGenreLeaderboard` | Top members |
| **Feed** | `CommunityFeed` | Posts (`#feed` anchor) — same stack as `/feed` |
| Crews | `CommunityCrewPanel`, `CommunityCrewLeaderboard` | Crew system |
| Challenges | `CommunityWeeklyChallenges` | Weekly missions |
| Academy loop | `AcademyLoopMissions` | Cross-link to academy |

### Feed stack

Shared by `/feed` and `CommunityFeed` on `/community`.

| Piece | File | Behaviour |
|-------|------|-----------|
| Data hook | `useCommunityFeed.ts` | Fetches via `community_feed` RPC; **load more** with cursor; listens for feed/comment/follow events |
| Service | `feedService.ts` | `fetchCommunityFeed`, create/update/hide posts, reactions |
| List UI | `CommunityFeed.tsx` | Sticky filters + composer; skeletons; infinite scroll sentinel + **Load more** button |
| Composer | `CommunityFeedComposer.tsx` | Modes: **Spin** (Spotify/YouTube), **Drop** (text, photo, external link) |
| Card | `CommunityFeedCard.tsx` | Body, link preview card, image, reactions, share link, owner menu (edit/remove) |
| Filters | `CommunityFeedFilters.tsx` | All · Following · Tribe · Spin · Drop |
| Comments | `CommunityFeedComments.tsx` | Threaded replies on `FeedPostPage` |
| Edit modal | `CommunityFeedEditPostModal.tsx` | Author edits own spin/drop (no time limit) |
| Link preview UI | `CommunityLinkPreviewCard.tsx` | Rich card (title, description, image) |

**Post kinds**

- **Spin** — `spotify_url` / `youtube_url`, optional `track_title`, caption (`body`).
- **Drop** — Short text (≤280), optional **Cloudinary** `image_url`, or **link-only** drop with OG fields stored on the row.

**Filters** (`feedFilters.ts`)

- `all` — everyone (default on `/feed`).
- `following` — posts from followed operators + crewmates + self (requires login).
- `tribe` — filtered by member primary genre slug.
- `spin` / `drop` — kind filter.

**Pagination** (migration `058`)

- RPC `community_feed(lim, p_kind, p_genre_slug, p_following_only, p_cursor_created_at, p_cursor_id)`.
- Client passes cursor from the last visible post (`created_at` + `id`); page size **30**.
- `hasMore` when a page returns `limit` rows; append on scroll or button.

### Composer & link previews

1. User pastes a URL in a drop → client debounces `fetchLinkPreview` (`src/lib/community/linkPreview.ts`).
2. **Dev:** Vite middleware serves the same logic as production.
3. **Prod:** `GET /api/link-preview` → `api/_lib/linkPreview.ts` (Open Graph scrape + optional **Microlink** fallback when `MICROLINK_API_KEY` is set on Vercel).
4. On publish, `link_url`, `link_title`, `link_description`, `link_image_url` are stored on `community_posts`.
5. Display: `normalizeLinkPreviewForDisplay` hides duplicate platform titles; `stripUrlFromText` avoids showing the raw URL when a card is shown.

Retail sites that block bots may return only a domain — that is expected unless Microlink (or a future dedicated scraper) is configured.

### Comments & replies

| Layer | File / RPC |
|-------|------------|
| Types | `commentTypes.ts` — `buildCommentThread` |
| Service | `commentService.ts` — add/list/delete; dispatches `COMMENT_EVENT` |
| DB | `052` comments + counts on feed; `055` `parent_id` + reply notifications |
| UI | `CommunityFeedComments.tsx` — reply affordance, nested thread |

**Notifications on comment**

- Top-level comment → `post_comment` to **post owner**.
- Reply → `post_comment` to **parent comment author** (not the replier).
- `href` in DB: `/feed/{postId}`.

### Post actions (owner)

| Action | RPC / service |
|--------|----------------|
| Hide (remove from feed) | `community_hide_own_post` (`054`) — `hideCommunityPost` |
| Edit drop caption / spin links | `community_update_own_drop` / `community_update_own_spin` (`056`) |

Errors from hide/update are surfaced in the card UI (no silent failure).

### Notifications (bell)

| Piece | Role |
|-------|------|
| `NetworkNotificationsPanel.tsx` | Navbar bell, list, mark all read |
| `useCommunityNotifications.ts` | Supabase Realtime on `community_notifications` INSERT (`057`); 45s poll; refresh on tab focus |
| `notificationService.ts` | Fetch unread, mark read, `notificationTargetHref` → `/feed/:postId` for comments |
| `localNotifications.ts` | Demo/local fallback inbox keyed per user when Supabase is off |

Kinds include `post_comment`, follows, and other community events enqueued by SQL triggers/RPCs in `052`/`055`.

### Member profile (`/network/:handle`)

**Page:** `CommunityMemberPage.tsx`

| Section | Component |
|---------|-----------|
| Header | `MemberProfileHeader` — avatar, bio, **followers/following** (clickable lists) |
| Tabs | `MemberProfileTabs` |
| Feed | `MemberProfileFeed` |
| Medals | `MemberProfileMedals` |
| Signal log | `MemberProfileSignalLog` |
| Academy | `MemberProfileAcademy` |

### Follow system

- `FollowButton.tsx` · `followService.ts`  
- Counts on profile header → list panel via `fetchMemberConnections`  

### Gamification

- **dB** — community points  
- **Ranks** — `src/lib/community/ranks.ts`  
- **Badges / medals** — `CommunityBadgeStrip`, `MedalIllustration`  
- **Genres / tribes** — genre onboarding gate, tribe panels  

### Community migrations (run in order in Supabase SQL editor)

| Migration | Purpose |
|-----------|---------|
| `051-community-post-images.sql` | `image_url` on posts; feed RPC columns |
| `052-community-post-comments.sql` | Comments table, `comment_count`, `post_comment` notifications |
| `053-community-post-link-preview.sql` | `link_*` columns; link-only drops; feed RPC |
| `054-community-hide-own-post.sql` | `community_hide_own_post` RPC |
| `055-community-comment-replies.sql` | `parent_id`, reply RPCs, reply notifications |
| `056-community-edit-own-post.sql` | Author edit spin/drop RPCs |
| `057-community-notifications-realtime.sql` | Realtime publication for `community_notifications` |
| `058-community-feed-pagination.sql` | Cursor params on `community_feed` |
| `059-discover-premiere-picks.sql` | Discover premieres: `discover_premiere_picks`, `discover_premiere_feed` (see [Discover wire](#discover-wire-discover)) |

---

## 10. Artist profiles & releases

### Public artist site (`/artist/:slug`)

**View:** `ArtistProfilePageView.tsx` (composed sections)

| Section | Component |
|---------|-----------|
| Hero | `ArtistSiteHero`, `CoverArt` |
| Sticky nav | `ArtistSiteStickyNav` |
| Story | `ArtistStorySection` |
| Lineup | `ArtistLineupSection` |
| Tracks | `TrackListWithPlayers`, `ArtistPickPlayer` |
| Streams | `ArtistStreamEmbed` |
| Merch | `ArtistMerchSection` |
| Press kit | `ArtistPressKitSection` |
| Network wire | `ArtistNetworkWire` |

### Releases

- **Discover wire §03** — hourly premiere carousel (`discover_premiere_feed`); **menu `/releases`** — full catalog (`releasesCatalog.ts`)  
- Artist dashboard **Releases** tab → `artist_releases` → `ReleaseDetailPage`, `ReleaseCountdown`, `ReleaseEmbed`  
- Scene discovery: `SceneReleaseRail` on scene hubs  

### Artist page lifecycle & recovery (migrations `061`–`063`)

| Concept | Behaviour |
|---------|-----------|
| **Page status** (`061`) | `page_status`: `pending` (draft checklist) vs `live` · UI label **Page update** on publish/refresh |
| **Activity** (`062`) | `last_activity_at` on profile; 60-day inactivity can archive live pages; 7-day incomplete drafts expire |
| **Archive** | `artist_profile_archives` stores JSON snapshot before delete |
| **Recovery** (`063`) | Artist uploads gov ID → `artist_page_recovery_requests` · IOS Support approves → restore via service role |

**Member-facing recovery:** `/support/artist` (`ArtistIosSupportPage.tsx`) when page was removed.

**Services:** `src/lib/artist-profile/pageEnforcement.ts`, `pageLifecycle.ts`, `archive.ts`, `src/lib/artist-page-recovery/service.ts`.

---

## 11. Editorial desk

### Content types (`EditorialType`)

- `review` — album/track review  
- `single` — single release write-up  
- `ep` — EP coverage  
- `feature` — long feature (can feature on homepage)  
- `band_profile` — band profile editorial  

### Publishing flow

1. Editor writes in **Write Editorial** tab (`RichTextEditor`)  
2. Saves **draft**  
3. **Publish** → slug generated → appears on site + optional homepage feature  
4. Gallery: `EditorialGalleryUpload` · YouTube import supported on profiles  

### Related components

- `FeaturedTransmissionBlock` — homepage feature block  
- `EditorialRelatedLinks`, `EditorialShareBar`  
- `EditorByline` — public editor attribution  

---

## 12. Music Production Academy

### Structure

- **Tracks** (slugs): `production`, `mixing`, `mastering`, `recording`, `genres`, `ear-training`, `release`  
- **Lessons** — `src/lib/academy/content/*.ts`  
- **Quizzes** — `src/lib/academy/content/quizzes.ts`  
- **Progress** — local + Supabase sync (`AcademyProgressSync`, migration `023`)  

### Key components

| Component | Role |
|-----------|------|
| `AcademyHubControls` | Search, filters on hub |
| `AcademyLessonShell` | Lesson layout wrapper |
| `AcademyLessonVideos` | Video embeds |
| `AcademyLessonComplete` | Mark complete + dB |
| `AcademyQuizPanel` | Quiz UI |
| `EarTrainingLab` / `EarFrequencyGame` | Ear lab |
| `AcademyCertificateNameField` | Name on certificate |

---

## 13. Studio toolkit (16 tools)

All tools use `ToolShell` layout + domain logic in `src/lib/tools/`.

| Phase | Tools |
|-------|--------|
| **Phase 1** | music-prompt, chords, artist-name, vocal-chain, tuning |
| **Phase 2** | bpm, tap-tempo, spectrum, clipping, loudness |
| **Phase 3** | key-scale, lyrics, setlist, audio-format, subgenre-tags, export-checklist |

Audio tools use **Web Audio API** (decode, spectrum, BPM) — runs in browser, no upload to server for analysis.

---

## 14. Scenes, events & collab

### Scenes

- Index: cities × genres  
- Hub: artists + releases for that scene  
- Data: `src/lib/artist-profile/discover.ts`, migration `039-discovery-scene-hub`  

### Events

- `EventsIndexPage` — list + filters  
- `EventRsvpButton` — RSVP tracking  
- Editors manage via `EditorEventsPanel`  

### Collab board

- `CollabBoardPage` — posts (need/offer)  
- `CollabBoardFilters`, `CollabSkillsEditor`, `MemberCollabSkills`  
- Migration `040-collab-phase15`  

---

## 15. Component library (by folder)

### `components/layout/`
V2 site chrome: `AppShell`, `Sidebar`, `TopBar`, `MobileNav`, `CommandPalette`. Legacy `Navbar` / `Layout` not wired in `App.tsx`.

### `components/auth/`
`ProtectedRoute`, `GoogleSignInButton`, `NetworkAuthPanel`, `ArtistAuthPanel`, `StatusBadge`.

### `components/dashboard/`
Desk shells and role panels (see [§7](#7-dashboards-detailed)).

| File | Role |
|------|------|
| `RoleDeskLayout.tsx` | Shared V2 desk chrome for all roles |
| `SuperEditorDeskLayout.tsx` | Super-editor nav + pipeline quick tiles |
| `DashboardCommunityHub.tsx` | dB, feed, collab skills (network tab) |
| `MemberTrustPanel.tsx` | Member trust / verification hints |
| `ArtistProfileEditor.tsx` | Full public artist page builder |
| `ReleaseEditor.tsx` | Premiere scheduling |
| `EditorProfilePanel.tsx` | Editor byline / public identity |
| `EditorWirePicksPanel.tsx` | Friday wire curation |
| `EditorEventsPanel.tsx` | Event moderation |
| `SuperEditorDashboardPreview.tsx` | Cross-role dashboard preview |
| `SuperEditorVerificationPanel.tsx` | Verification claims queue |
| `SubmissionLifecycleTimeline.tsx` | Artist submission status UI |
| `DashboardSection.tsx` | Section wrapper (step, title, hint) |

### `components/community/`
Feed composer/cards/comments, link preview card, edit modal, tribes, crews, challenges, notifications, onboarding, follow, medals.

### `components/community/member/`
Public profile subcomponents.

### `components/artist-profile/`
Public artist site sections and players.

### `components/editor/` & `editor-applications/`
Rich text, gallery, editor apply flow, congrats gate.

### `components/editorial/`
Homepage editorial blocks, tribe bridge, share bar.

### `components/academy/`
Lessons, quizzes, ear lab, certificates, sync banner.

### `components/tools/`
Tool UI shells, spectrum canvas, BPM gauge, copy output.

### `components/sections/` & `sections/magazine/`
Homepage and magazine section blocks.

### `components/cards/`
`SignalCard`, `ReviewCard`, `EditorialCard`, `ArtistCard`, `CommunityCard`.

### `components/ui/`
Design system primitives: `Button`, `Input`, `IOSImage`, `LoadingTransmission`, `SectionHeading`, `RankBadge`, `MetalBadge`, modals, uploads.

### `components/seo/`
`RouteSeo`, `GlobalJsonLd`, breadcrumbs meta.

### `components/pwa/`
`PwaInstallPrompt` — install banner (hidden in standalone).

### `components/effects/`
`GrainOverlay` — film grain over site.

### `components/discover/`
Wire index sections (01–09), roster carousel, playlist/scene covers, shared `DiscoverSections` intro.

### `components/discovery/`
`DiscoveryPathsPanel` and related path UI (community hub cross-links).

### `components/collab/`, `components/events/`, `components/releases/`
Domain-specific UI for those features.

---

## 16. Data & backend

### Supabase tables (high level, via migrations)

| Area | Migrations (examples) |
|------|------------------------|
| Auth & profiles | `006`, `009`, `042`, `043`, `045` |
| Artist profiles | `006`, `010`–`017`, `038` |
| Editorial & submissions | `018`, `024`, submissions in services |
| Community | `025`–`036`, `031` member profiles |
| Feed v2 (images, comments, links, pagination) | `051`–`058` (see [§9](#9-community--network)) |
| Discover premieres | `059` — `discover_premiere_picks`, `discover_premiere_feed` RPC |
| Direct messages | `050` |
| Social graph | `036` follows |
| Academy progress | `023`, `035` |
| Events | `037`, `041` |
| Collab | `040` |
| Editor applications | `022` |
| Scenes | `039` |
| Playlist curator applications | `060` |
| Artist page status | `061` |
| Artist page lifecycle (activity, purge SQL) | `062` |
| Artist page recovery | `063` |

### Key services (`src/lib/`)

| Module | Responsibility |
|--------|----------------|
| `auth/` | Login, session, roles, profile updates |
| `community/` | Feed, comments, link previews, crews, tribes, follow, notifications |
| `submissions/` | Track submissions + editorial drafts |
| `artist-profile/` | CRUD public artist pages |
| `analytics/` | Super editor stats + role user lists |
| `academy/` | Lessons, progress, quizzes |
| `releases/` | Release scheduling |
| `discovery/` | Discover wire data: premieres, scenes, events, listeners, playlists, labels, community pulse |
| `verification/` | Role verification queue, relationship claims |
| `playlistCurator/` | Curator applications (member apply + desk review) |
| `artist-page-recovery/` | Deleted page archives + recovery requests |
| `editor-applications/` | Apply to join editorial desk |

### Discover hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useDiscoverPremieres` | Premiere feed + hourly UTC refresh |
| `useDiscoverPulse` | Tribes, top spins, crews for §09 |

### Static API (`public/api/`)

Homepage magazine content until fully CMS-driven from Supabase. Discover sections prefer Supabase/RPC with **showcase fallbacks** in `src/lib/discovery/*` when unconfigured.

### Vercel serverless (`api/`)

| Route | Purpose |
|-------|---------|
| `api/v1/[...path].ts` | **All** `/api/v1/*` JSON API (one function — see [§16.4](#164-api-v1-vercel)) |
| `api/link-preview.ts` | OG scrape + optional Microlink; used by feed composer |
| `api/thumbnail.ts` | Resolve thumbnail URL for a link |
| `api/import-catalog.ts` | Spotify/YouTube catalog import for artist studio |
| `api/share/artist.ts`, `feature.ts`, `site.ts` | Social share HTML/meta |
| `api/og/artist.tsx`, `site.tsx` | OG image generation |
| `api/_lib/linkPreview.ts` | Shared link preview (also in `vite.config.ts` dev middleware) |
| `api/_lib/devV1Router.ts` | Local dev: Vite proxies `/api/v1/*` to `dispatchV1Api` |

**Do not** use `api/v1/[[...path]].ts` (optional catch-all) on Vercel — it may not register; use `api/v1/[...path].ts`.

### 16.4 API v1 (Vercel)

**Goal:** Sensitive reads/writes go through **Vercel serverless** (`/api/v1/*`) with the user JWT, not direct browser → Supabase for those modules. No separate paid Node backend.

```
Browser (React)  --Bearer JWT-->  /api/v1/*  --user or service client-->  Supabase
```

| Piece | Path |
|-------|------|
| Entry (prod) | `api/v1/[...path].ts` → `api/_lib/v1Router.ts` |
| Client | `src/api/v1Client.ts` · flag `isV1ApiEnabled()` |
| Fallback | `src/api/v1Fallback.ts` — on **404**, retry direct Supabase so UI keeps working |
| Local dev | `vite.config.ts` → `dispatchV1DevApi` for `/api/v1/*` |

**Enable:** `VITE_USE_V1_API=true` in `.env` / Vercel (see `.env.example`). Server keys `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are **not** `VITE_` prefixed.

#### Migration phases (client wiring)

| Phase | Domains | Wired in `src/lib/…` when flag on |
|-------|---------|----------------------------------|
| **1** | Session + artist profile | `artist-profile/service.ts` → `/me`, `/artist/profile` |
| **2** | Community feed | `community/feedService.ts` → feed, spins, drops, reactions, edit, hide |
| **3** | Verification, playlist curator, artist recovery | `verification/service.ts`, `playlistCurator/service.ts`, `artist-page-recovery/service.ts` |
| **3b** | Network + public member profile | `network/connectionService.ts`, `community/memberProfileService.ts`, `community/crewService.ts` (profile crew/roster), `artist-profile/networkLink.ts` → `/api/v1/network/*` |
| **4** (planned) | Remaining modules, trim `localStorage` demos, optional RLS lockdown | — |

**Cursor rule:** `.cursor/rules/api-only-frontend.mdc` — new UI code must not call Supabase tables/RPC directly; add `/api/v1` routes instead.

**Still direct Supabase (no v1 yet):** track **submissions** (`submissions/service.ts`), editorial drafts, **releases** (profile tab uses `releases/service.ts`), events, collab, academy, most discovery, follow toggles.

#### `/api/v1` route map

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/v1/me` | Bearer | Member profile + role |
| GET, PUT | `/api/v1/artist/profile` | Bearer | Own artist page |
| GET | `/api/v1/community/feed` | Optional | Cursor pagination query params |
| POST | `/api/v1/community/spins` | Bearer | Create spin |
| POST, PATCH | `/api/v1/community/drops` | Bearer | Create / edit drop |
| PATCH | `/api/v1/community/spin` | Bearer | Edit spin |
| POST | `/api/v1/community/reactions` | Bearer | Toggle reaction |
| DELETE | `/api/v1/community/post` | Bearer | Hide own post |
| GET, POST | `/api/v1/verification/requests` | Bearer | My role verification |
| GET, PATCH | `/api/v1/verification/desk/requests` | Super editor | Queue; approve sets `dashboard_persona` |
| GET | `/api/v1/verification/claims/incoming` | Bearer | Claims against you |
| GET | `/api/v1/verification/claims/outgoing` | Bearer | Your claims |
| POST, PATCH | `/api/v1/verification/claims` | Bearer | Create / respond |
| GET, POST | `/api/v1/playlist-curator/applications` | Bearer | Apply as curator |
| GET, PATCH | `/api/v1/playlist-curator/desk/applications` | Super editor | Review applications |
| GET | `/api/v1/artist-recovery/archive` | Bearer | Latest deleted archive for user |
| GET | `/api/v1/artist-recovery/request?archiveId=` | Bearer | Own recovery request |
| POST | `/api/v1/artist-recovery/requests` | Bearer | Submit recovery |
| GET | `/api/v1/artist-recovery/desk/deleted-pages` | Super editor | Archives + requests |
| PATCH | `/api/v1/artist-recovery/desk/requests` | Super editor | Approve/reject; restore uses **service role** (`api/_lib/artistRecoveryRestore.ts`) |
| GET | `/api/v1/network/profile?handle=` | Optional | Public member profile |
| GET | `/api/v1/network/profile/posts?handle=` | Optional | Posts by handle |
| GET | `/api/v1/network/profile/activity?handle=` | Optional | Activity log |
| GET | `/api/v1/network/profile/followers?handle=` | Optional | Followers list |
| GET | `/api/v1/network/profile/following?handle=` | Optional | Following list |
| GET | `/api/v1/network/profile/artist?userId=` | Optional | Published artist id + slug |
| GET | `/api/v1/network/profile/crew?userId=` | Optional | User's crew |
| GET | `/api/v1/network/crew/roster?crewId=` | Optional | Crew roster |
| POST, PATCH, DELETE | `/api/v1/network/connections/request` | Bearer | Send / respond to connect request |
| DELETE | `/api/v1/network/connections` | Bearer | Remove connection (`targetUserId` body) |
| GET | `/api/v1/network/connections?userId=` | Optional | Connection list |
| GET | `/api/v1/network/connections/mutual?targetUserId=` | Optional | Mutual connections |
| GET | `/api/v1/network/connections/incoming?fromUserId=` | Bearer | Pending request id |
| GET | `/api/v1/network/requests/pending` | Bearer | Incoming connect requests |
| GET | `/api/v1/network/people/suggested` | Optional | Suggested people |
| GET | `/api/v1/network/people/search?q=` | Optional | People search |

Desk guard: `api/_lib/requireDesk.ts` → `profiles.role === 'super_editor'`.

#### Build & deploy

```bash
npm run build   # sitemap + pwa:icons + tsc -p api/tsconfig.json + tsc -b + vite build
```

- `api/tsconfig.json` — typechecks `api/` and shared `src/lib` imports (`@/*` paths).
- `tsconfig.node.json` — must include `@/*` paths (vite.config imports `api/_lib/*`).
- `vercel.json` — `functions["api/v1/[...path].ts"].includeFiles`: `src/lib/**`

**Smoke test after deploy:**

```bash
curl -sL -o /dev/null -w "%{http_code}\n" "https://instituteofsound.in/api/v1/me"
# 401 = route OK · 404 = function not deployed — check api/v1/[...path].ts and redeploy
```

**Troubleshooting**

| Symptom | Likely cause |
|---------|----------------|
| `Request failed (404)` on dashboard with v1 flag | `/api/v1/*` not deployed or wrong filename (`[[...path]]` vs `[...path]`) |
| Submit to editors shows 404 | Usually failed **refresh** after submit (v1 profile/recovery), not `track_submissions` |
| Build TS2307 on `@/lib/…` during `tsc -b` | Add `paths` to `tsconfig.node.json` |
| Hobby “12 functions” exceeded | Keep one `api/v1/[...path].ts` catch-all (do not split per route) |

---

## 17. PWA & install

| Asset | Path |
|-------|------|
| Master icon (SVG) | `public/pwa/icon-master.svg` |
| PNG sizes | `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` |
| Apple touch | `apple-touch-icon.png` (+ 167, 152, 120) |
| Manifest | Generated by Vite PWA plugin in `vite.config.ts` |
| Standalone detect | `src/lib/pwa/standalone.ts` |

**Build:** `npm run pwa:icons` then `vite build`.

**Installed app:** `display: standalone`, portrait, theme `#050505`, short name **IOS**.

---

## 18. Environment variables & scripts

See `.env.example` and setup docs:

- `SUPABASE_SETUP.md` — database + auth  
- `CLOUDINARY_SETUP.md` — image uploads  

Common vars:

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Public anon key |
| `SUPABASE_URL` | Server (Vercel + `.env`) | Same URL for API routes |
| `SUPABASE_ANON_KEY` | Server | Verify user JWT in `/api/v1` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Desk recovery restore, admin-only ops |
| `VITE_USE_V1_API` | Client | `true` / `1` / `yes` → route wired modules through `/api/v1` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Client | Image uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Client | Unsigned preset |
| `VITE_SITE_URL` | Client | Canonical URL for SEO / auth redirects |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | Server | Catalog import |
| `YOUTUBE_API_KEY` | Server | Catalog import |
| `MICROLINK_API_KEY` | Server (optional) | Richer link previews |

Never put `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_` variable.

### npm scripts

```bash
npm run dev          # Local dev server
npm run build        # sitemap + icons + tsc + vite build
npm run pwa:icons    # Regenerate PNG icons from SVG master
npm run sitemap      # Regenerate public/sitemap.xml
npm run preview      # Preview production build
```

---

## 19. SEO & contact

- **Per-route SEO:** `RouteSeo` + `src/lib/seo/staticRoutes.ts`  
- **JSON-LD:** Organization, WebSite, Article, Course in `src/lib/seo/jsonLd.ts`  
- **Sitemap:** `public/sitemap.xml` (build script)  

**Contact** (`src/lib/site/contact.ts`):

- Email: iosinstituteofsound@gmail.com  
- Instagram: @instituteofsound_  

---

## Quick reference: who goes where

```
New visitor → / → Register (Google) → **Member desk** (`RoleDeskLayout`)
Member → `/member/upgrade` → **Artist desk**
Member → Editor Apply → Editor (after approval) → **Editor desk**
Super Editor → **Super editor desk** (Command + Editorial groups)
All desks sit inside global **AppShell** (sidebar + top bar / mobile tabs)
```

---

*For setup steps, see root `README.md`, `SUPABASE_SETUP.md`, and `CLOUDINARY_SETUP.md`.*
