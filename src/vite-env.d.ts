/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Production URL for email confirm links — https://instituteofsound.vercel.app */
  readonly VITE_SITE_URL?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
  /** When true, artist profile load/save uses /api/v1 (requires server Supabase env). */
  readonly VITE_USE_V1_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
