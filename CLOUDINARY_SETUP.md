# Cloudinary setup — Institute of Sound

Uploaded **images, video, and audio** (feed posts, artwork, etc.) go to **Cloudinary** and load from their global CDN.

## Current architecture

| Flow | How it works |
|------|----------------|
| **Feed upload (active app)** | Browser → `POST /api/v1/media/upload` → API uploads to Cloudinary → returns `secure_url` |
| **Direct browser upload (legacy / future)** | Browser → `POST /api/v1/media/sign` → upload to `api.cloudinary.com` |

When Cloudinary env vars are **not** set, the API falls back to local disk (`uploads/feed/`) for development.

## 1. Create a Cloudinary account

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up (free tier is fine).
2. Open the **Dashboard** and copy your **Cloud name**, **API Key**, and **API Secret**.

## 2. Upload preset (optional — for `/media/sign` only)

1. **Settings** → **Upload** → **Upload presets** → **Add upload preset**
2. Name: e.g. `ios_signed`
3. **Signing Mode**: **Signed**
4. **Allowed formats**: jpg, png, webp, gif, mp4, webm, mov, mp3, wav, ogg, m4a
5. **Max file size**: match `MAX_UPLOAD_MB` (default 50 MB)

## 3. API env (Render / `.env`)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=ios_signed
CLOUDINARY_UPLOAD_FOLDER=ios/feed
```

Never expose `CLOUDINARY_API_SECRET` in `VITE_*` vars.

## 4. Browser env (optional)

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Only needed if you add client-side direct uploads later.

## Upload folders

| Folder | Use |
|--------|-----|
| `ios/feed` | Feed images, video, audio (default server upload folder) |
| `ios/submissions` | Artist track artwork |
| `ios/editorial` | Editor draft / feature images |
| `ios/community` | Community posts |
| `ios/press-kits` | PDF / raw files |

## Verify

After deploy, check:

```bash
curl -s https://your-api.onrender.com/health
```

`data.cloudinary` should be `true` when configured.
