import { applyThemeTokens, resolveThemeMode } from '@/shared/lib/apply-theme'
import type { ThemeTokens } from '@/shared/design-tokens/theme-tokens'

type StudioOverridePayload = {
  slug?: string
  tokens: ThemeTokens
}

/**
 * Opt-in runtime theme from Studio export.
 * Enable with VITE_STUDIO_OVERRIDE=1 in .env.local (after running export:apply --web).
 */
export async function loadStudioOverrideIfEnabled(): Promise<void> {
  if (import.meta.env.VITE_STUDIO_OVERRIDE !== '1') return

  try {
    const res = await fetch('/studio-override/theme.json', { cache: 'no-store' })
    if (!res.ok) return

    const data = (await res.json()) as StudioOverridePayload
    if (!data?.tokens) return

    const mode = resolveThemeMode(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    )
    applyThemeTokens(data.tokens, mode, { slug: data.slug ?? 'studio-override' })
    console.info('[studio-override] Applied web theme from public/studio-override/theme.json')
  } catch {
    /* override file optional */
  }
}
