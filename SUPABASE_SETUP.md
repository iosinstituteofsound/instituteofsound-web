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

## 3. Auth URLs (fixes localhost in confirmation emails)

1. **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://instituteofsound.in`
3. **Redirect URLs** — add:
   - `https://instituteofsound.in/**`
   - `https://www.instituteofsound.in/**` (if you use www)
   - `http://localhost:5173/**` (local dev only)
4. **Vercel** → Environment Variables (Production) → **redeploy after save**:
   - `VITE_SITE_URL` = `https://instituteofsound.in`
5. Redeploy after changing env vars.

Email links go to `/auth/callback` on your live site.

## 4. Google sign-in (required)

1. **Authentication** → **Providers** → **Google** → Enable
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - OAuth client type: **Web application**
   - **Authorized redirect URIs** — add:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     (find exact callback in Supabase → Google provider settings)
3. Paste **Client ID** and **Client Secret** into Supabase Google provider → Save
4. Email/password signup is **disabled in the app** — artists and staff use Google only.
5. Super admin: sign in at `/desk` with Google (`tlssymbols@gmail.com` must be `super_editor` in `profiles`).

## 5. Environment variables

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
VITE_SITE_URL=https://instituteofsound.in
```

4. Restart dev server:

```bash
npm run dev
```

Navbar / login will use **Supabase mode** (real accounts in the cloud).

## 6. Create test users

### Option A — Google in the app

1. `/login` → **Continue with Google** (artist)
2. `/desk` → **Continue with Google** (super editor only)

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

## 7. Verify

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

If `.env` is missing, Google sign-in is unavailable until Supabase is configured.
