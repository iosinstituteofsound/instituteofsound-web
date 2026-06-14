/** Build `/network/@handle` paths consistently across the app. */
export function normalizeNetworkHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
}

export function networkProfilePath(handle: string): string {
  const h = normalizeNetworkHandle(handle)
  return h ? `/network/${encodeURIComponent(h)}` : '/community'
}

export function networkProfilePathFromEntry(handle: string): string {
  return networkProfilePath(handle)
}
