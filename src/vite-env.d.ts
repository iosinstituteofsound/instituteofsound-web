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
  readonly VITE_WS_ENABLED?: string
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string
      alt?: string
      poster?: string
      'ios-src'?: string
      crossorigin?: string
      'environment-image'?: string
      'shadow-intensity'?: string
      exposure?: string
      'camera-controls'?: boolean | ''
      'auto-rotate'?: boolean | ''
      'interaction-prompt'?: string
      'touch-action'?: string
      loading?: string
      reveal?: string
      bounds?: string
    }
  }
}
