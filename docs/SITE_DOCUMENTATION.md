# Institute of Sound — Site Documentation

> **Local reference only.** Describes the full product: routes, roles, dashboards, components, and data flow.  
> Last updated: May 2026 · Repo: `instituteofsound`

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
16. [Data & backend](#16-data--backend)
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
├── supabase/migrations/     ← PostgreSQL schema (001–045+)
├── src/
│   ├── App.tsx              ← All routes
│   ├── main.tsx             ← Providers, mount
│   ├── api/                 ← HTTP client + endpoint fetchers
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

### Layout (`src/components/layout/Layout.tsx`)

Wraps every page with:

- `Navbar` + `Footer` (footer hidden when logged in)
- `GrainOverlay`, SEO (`RouteSeo`, `GlobalJsonLd`)
- Gates: `ManifestoGateModal`, `EditorCongratsGate`, `CommunityOnboardingGate`, `AcademyProgressSync`
- `PwaInstallPrompt` (browser install banner)

### Logged-out vs logged-in nav

| State | Navbar behavior |
|-------|-----------------|
| **Guest / browser** | Brand lockup + **Menu** drawer (mega-nav groups from `public/api/nav.json`) |
| **Logged in** | **App bar:** hamburger (left), section title (center), notifications + avatar (right) |
| **PWA installed (standalone)** | Same app bar even if guest — menu always visible on mobile |

Nav groups (`src/lib/nav/groupLinks.ts`):

- **Discover** — Home, Discover, Scenes, Events, …  
- **Editorial** — Features, Signals, Archive, …  
- **Toolkit** — Hub + all 16 tools  
- **Academy** — Hub, quizzes, ear lab, certificates  
- **Access** — Login, Register, Dashboard links  

### Key layout components

| File | Role |
|------|------|
| `Navbar.tsx` | Header, drawer, app mode |
| `NavDropdown.tsx` | Desktop mega-menu dropdowns |
| `NavMenuToggle.tsx` | Mobile hamburger |
| `NavUserIdentity.tsx` | Avatar, dashboard links, logout |
| `ArtistNavActions.tsx` | Join with Google / editor apply CTAs |
| `Footer.tsx` | Site footer columns from API |

---

## 6. All routes (URL map)

### Magazine & culture (public)

| Path | Page file | What it is |
|------|-----------|------------|
| `/` | `HomePage.tsx` | Cover story, trending, reviews, features, playlists, signals |
| `/discover` | `DiscoverPage.tsx` | Live artist profiles from Supabase |
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
| `/community` | `CommunityPage.tsx` | Hub: tribes, leaderboard, feed anchor `#feed` |
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

### 7.1 Member Dashboard — `/member/dashboard`

**File:** `src/pages/dashboard/MemberDashboardPage.tsx`

**Purpose:** Default home for **members** (promoters, managers, labels, brands, listeners).

#### Header actions
- Public profile (`/network/:handle`)
- Community feed
- Site home
- Logout

#### Workspace persona picker (first visit)
User picks one of four personas (modal explains role + capabilities):

| Persona | Focus |
|---------|--------|
| Event Promoter | Events, RSVPs, scenes, collab crew |
| Artist Manager | Releases, editorial submit, collab |
| Label | Roster, release calendar, scene promotion |
| Brand | Scene hubs, campaigns, events |

After selection, dashboard shows:
- **Priorities** list  
- **Workflow board** (3 stages)  
- **Toolkit focus** bullets  
- **Quick action links** (Events, Scenes, Collab, Discover, Upgrade, etc.)  
- **Reset** — clears persona, returns to picker  

#### Always visible sections
- **`MemberTrustPanel`** — trust/verification hints for persona  
- **Explore grid** — Scenes, Events, Collab, Discover cards  
- **`DashboardCommunityHub`** — dB rank, weekly dB, feed link, collab skills editor  

#### Side paths (when no persona or via cards)
- **Artist path** → `/member/upgrade` (become artist)  
- **Editorial path** → `/editor/apply`, `/editor/join`  

---

### 7.2 Artist Dashboard — `/artist/dashboard`

**File:** `src/pages/dashboard/ArtistDashboardPage.tsx`

**Purpose:** **My Studio** — manage public artist page, releases, and editor submissions.

#### Tabs

| Tab ID | Label | Contents |
|--------|-------|----------|
| `network` | Network | `DashboardCommunityHub` — feed, dB, collab skills |
| `profile` | Your page | `ArtistProfileEditor` — full public page builder |
| `releases` | Releases | `ReleaseEditor` — schedule premieres |
| `submit` | Submit to editors | Form: track title, genre, stream URL, cover, description |
| `history` | Submissions | List + `SubmissionLifecycleTimeline` per track |

#### Stats bar
- Total submissions, pending, approved counts  

#### Quick start card
Buttons: Complete your page → Open releases → Submit a track  

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

**Purpose:** Review artist track submissions, write/publish editorial, manage wire picks & events.

#### Tabs — regular Editor

| Tab | Component / function |
|-----|----------------------|
| **Submission Queue** | Filter: pending / in_review / approved / rejected. Open row → review panel, approve/reject, editor notes, optional wire suggestion on approve |
| **Wire Picks** | `EditorWirePicksPanel` — curate Friday wire |
| **Events** | `EditorEventsPanel` — moderate event listings |
| **Write Editorial** | Rich text draft form: type (review, single, ep, feature, band_profile), title, body, cover, Spotify/YouTube, gallery, link artist profile, homepage feature flag |
| **My Drafts** | List drafts → publish to site |
| **Network** | `DashboardCommunityHub` |
| **My Profile** | `EditorProfilePanel` — byline, avatar, public editor identity |

#### Extra tabs — Super Editor only

| Tab | Component | What it does |
|-----|-----------|--------------|
| **Analytics** | `SuperAdminAnalytics` | User counts by role (Listeners, Artists, Editors, Super Editors, Total) — **clickable** → `AnalyticsDetailPanel` user lists |
| **Dashboard Preview** | `SuperEditorDashboardPreview` | Preview other role dashboards |
| **Verification Queue** | `SuperEditorVerificationPanel` | Role verification claims |
| **Editor Applications** | `EditorApplicationsPanel` | Approve/deny editor applicants |

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

### Discover (`DiscoverPage.tsx`)

Lists **live Supabase artist profiles** with search/filter — links to `/artist/:slug`.

---

## 9. Community & network

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
| **Feed** | `CommunityFeed` | Posts (`#feed` anchor) — composer + cards |
| Crews | `CommunityCrewPanel`, `CommunityCrewLeaderboard` | Crew system |
| Challenges | `CommunityWeeklyChallenges` | Weekly missions |
| Academy loop | `AcademyLoopMissions` | Cross-link to academy |

### Feed (`CommunityFeed.tsx`)

- **Composer** (`CommunityFeedComposer`) — post Spin/Drop (logged in)  
- **Cards** (`CommunityFeedCard`) — reactions, **Follow** button  
- **Filters** (`CommunityFeedFilters`)  

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

### Notifications

- `NetworkNotificationsPanel` — bell in app navbar  
- `notificationService.ts`, `useCommunityNotifications` hook  

### Gamification

- **dB** — community points  
- **Ranks** — `src/lib/community/ranks.ts`  
- **Badges / medals** — `CommunityBadgeStrip`, `MedalIllustration`  
- **Genres / tribes** — genre onboarding gate, tribe panels  

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

- Scheduled on dashboard → public release pages  
- `ReleaseDetailPage`, `ReleaseCountdown`, `ReleaseEmbed`  
- Scene discovery: `SceneReleaseRail` on scene hubs  

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
Site chrome: Navbar, Footer, nav dropdowns, identity, PWA-aware app shell.

### `components/auth/`
`ProtectedRoute`, `GoogleSignInButton`, `NetworkAuthPanel`, `ArtistAuthPanel`, `StatusBadge`.

### `components/dashboard/`
All dashboard-specific panels (see [§7](#7-dashboards-detailed)).

### `components/community/`
Feed, tribes, crews, challenges, notifications, onboarding, follow, medals.

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

### `components/collab/`, `components/events/`, `components/discovery/`, `components/releases/`
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
| Social graph | `036` follows |
| Academy progress | `023`, `035` |
| Events | `037`, `041` |
| Collab | `040` |
| Editor applications | `022` |
| Scenes | `039` |

### Key services (`src/lib/`)

| Module | Responsibility |
|--------|----------------|
| `auth/` | Login, session, roles, profile updates |
| `community/` | Feed, crews, tribes, follow, notifications |
| `submissions/` | Track submissions + editorial drafts |
| `artist-profile/` | CRUD public artist pages |
| `analytics/` | Super editor stats + role user lists |
| `academy/` | Lessons, progress, quizzes |
| `releases/` | Release scheduling |
| `verification/` | Role verification queue |

### Static API (`public/api/`)

Homepage magazine content until fully CMS-driven from Supabase.

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

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`  
- `VITE_SITE_URL` — canonical URL for SEO  
- `VITE_YOUTUBE_API_KEY` — artist catalog import  

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
New visitor → / → Register (Google) → Member Dashboard
Member → Upgrade → Artist Dashboard + /artist/:slug
Member → Editor Apply → Editor (after approval) → Editor Dashboard
Super Editor → Editor Dashboard + Analytics / Verification / Applications
```

---

*For setup steps, see root `README.md`, `SUPABASE_SETUP.md`, and `CLOUDINARY_SETUP.md`.*
