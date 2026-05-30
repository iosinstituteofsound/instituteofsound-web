# Cloudinary setup — Institute of Sound

All **uploaded** images (track artwork, editorial covers) go to **Cloudinary** and load from their global CDN (`f_auto`, `q_auto`, responsive widths) for fast delivery.

## 1. Create a Cloudinary account

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up (free tier is fine).
2. Open the **Dashboard** and copy your **Cloud name**.

## 2. Signed upload preset (required)

1. **Settings** → **Upload** → **Upload presets** → **Add upload preset** (or edit existing)
2. Name: e.g. `ios_signed`
3. **Signing Mode**: **Signed** (not Unsigned — blocks random uploads without server signature)
4. **Folder**: optional default `instituteofsound` (app sends `ios/...` subfolders via signed params)
5. **Allowed formats**: jpg, png, webp, gif, avif (+ raw for PDFs on same or separate preset)
6. **Max file size**: 10 MB images / 15 MB PDFs
7. Save

## 3. API key (server only)

1. **Settings** → **API Keys** → use a **non-Root** key pair
2. Add to `.env` / Vercel (never `VITE_`):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=ios_signed
```

## 4. Add to `.env` (browser + server)

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ios_signed
```

Restart dev server after saving:

```bash
npm run dev
```

## 5. Supabase (optional)

If you use Supabase, run in SQL Editor:

`supabase/migrations/004-cloudinary-images.sql`

This adds `cover_image_url` on `track_submissions` and `editorial_drafts`.

## Upload folders

| Folder | Use |
|--------|-----|
| `ios/submissions` | Artist track artwork |
| `ios/editorial` | Editor draft / feature images |
| `ios/artists` | Band profiles (future) |
| `ios/features` | Magazine features (future) |
| `ios/press-kits` | Artist EPK / press kit PDFs (raw upload) |

## Display

The app uses `IOSImage` — Cloudinary URLs get `f_auto,q_auto,w_*` transforms. External demo URLs (Unsplash in JSON) still work; enable **Fetched URL** in Cloudinary if you want those optimized too.

## Security note

Uploads are **signed server-side** via `POST /api/v1/media/sign` (login required). Only whitelisted `ios/*` folders are allowed. Never put `CLOUDINARY_API_SECRET` in `VITE_*` env vars.
