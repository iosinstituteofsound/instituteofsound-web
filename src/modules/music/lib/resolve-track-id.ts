const MONGO_OBJECT_ID = /^[a-f0-9]{24}$/i

export function resolvePlaylistTrackId(...candidates: Array<string | undefined | null>): string | undefined {
  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value && MONGO_OBJECT_ID.test(value)) return value
  }
  return undefined
}
