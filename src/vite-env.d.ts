/// <reference types="vite/client" />

interface EyeDropperResult {
  sRGBHex: string
}

interface EyeDropper {
  open(): Promise<EyeDropperResult>
}

interface EyeDropperConstructor {
  new (): EyeDropper
}

interface Window {
  EyeDropper?: EyeDropperConstructor
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SITE_URL: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
