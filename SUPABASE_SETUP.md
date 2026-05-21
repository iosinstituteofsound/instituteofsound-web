# Supabase Setup — Institute of Sound

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → name it (e.g. `institute-of-sound`)
3. Save the database password

## 2. Run database schema

1. Open **SQL Editor** in your project
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

This creates:

- `profiles` (editor / artist roles)
- `track_submissions` (artist → editor queue)
- `editorial_drafts` (editor write-ups)
- Row Level Security (RLS) policies

## 3. Auth settings (important for dev)

1. **Authentication** → **Providers** → Email → enabled
2. For quick local testing, disable email confirmation:
   - **Authentication** → **Sign In / Providers** → Email
   - Turn off **Confirm email** (or use the confirmation link from inbox)

## 4. Environment variables

1. **Project Settings** → **API**
2. Copy **Project URL** and **anon public** key
3. In this repo:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

4. Restart dev server:

```bash
npm run dev
```

Navbar / login will use **Supabase mode** (real accounts in the cloud).

## 5. Create test users

### Option A — Register in the app

1. `/register` → choose **Editor** or **Artist**
2. Sign up with your email

### Option B — Supabase Dashboard

**Authentication** → **Users** → **Add user**  
Set **User Metadata** (JSON):

```json
{ "name": "Mira Volkov", "role": "editor" }
```

or

```json
{ "name": "VOID ECHO", "role": "artist" }
```

The trigger creates the matching `profiles` row automatically.

## 6. Verify

| Step | Action |
|------|--------|
| Artist | Register/login → `/artist/dashboard` → submit a track |
| Editor | Register/login → `/editor/dashboard` → see submission in queue |
| Editor | Approve/reject + notes |
| Artist | Refresh **My Submissions** → see status + feedback |

## Tables reference

| Table | Purpose |
|-------|---------|
| `profiles` | Role per user (`editor` \| `artist`) |
| `track_submissions` | Artist track queue for editors |
| `editorial_drafts` | Editor reviews & features |

## Without Supabase

If `.env` is missing, the app uses **localStorage demo mode**:

- `editor@ios.test` / `editor123`
- `artist@ios.test` / `artist123`

Data stays in the browser only.
