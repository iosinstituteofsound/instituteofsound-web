# Cloudinary setup — Institute of Sound

All **uploaded** images (track artwork, editorial covers) go to **Cloudinary** and load from their global CDN (`f_auto`, `q_auto`, responsive widths) for fast delivery.

## 1. Create a Cloudinary account

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up (free tier is fine).
2. Open the **Dashboard** and copy your **Cloud name**.

## 2. Unsigned upload preset (required for browser uploads)

1. **Settings** → **Upload** → **Upload presets** → **Add upload preset**
2. Name: e.g. `ios_unsigned`
3. **Signing Mode**: **Unsigned**
4. **Folder**: optional default `ios` (we also set folder per upload in code)
5. Save

## 3. Add to `.env`

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ios_unsigned
```

Restart dev server after saving:

```bash
npm run dev
```

## 4. Supabase (optional)

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

## Display

The app uses `IOSImage` — Cloudinary URLs get `f_auto,q_auto,w_*` transforms. External demo URLs (Unsplash in JSON) still work; enable **Fetched URL** in Cloudinary if you want those optimized too.

## Security note

Only the **unsigned upload preset name** and **cloud name** belong in the frontend. Never put API secret in `VITE_*` env vars.
