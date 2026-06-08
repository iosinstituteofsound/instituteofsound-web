/** True when the app uses instituteofsound-api (not localStorage demo). */
export function isLiveApiMode(): boolean {
  const flag = import.meta.env.VITE_USE_V1_API?.trim().toLowerCase()
  return flag === '1' || flag === 'true' || flag === 'yes'
}

/** @deprecated Use isLiveApiMode — kept for incremental migration. */
export const isSupabaseConfigured = isLiveApiMode

export function getLiveApiConfigHint(): string | null {
  if (isLiveApiMode()) return null
  return 'Live data requires VITE_USE_V1_API=true and instituteofsound-api running on port 4000.'
}
