export const COMMUNITY_DB_EVENT = 'ios-community-db-change'

export function subscribeCommunityDb(listener: () => void): () => void {
  window.addEventListener(COMMUNITY_DB_EVENT, listener)
  return () => window.removeEventListener(COMMUNITY_DB_EVENT, listener)
}
