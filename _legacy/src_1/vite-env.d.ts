/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Production URL for email confirm links */
  readonly VITE_SITE_URL?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
  /** Express API base URL (Railway) — no trailing slash */
  readonly VITE_API_BASE_URL?: string
  /** When true, app data uses Express /api/v1 */
  readonly VITE_USE_V1_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
