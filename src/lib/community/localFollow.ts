const KEY = 'ios_community_follows'

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]))
  } catch {
    /* ignore */
  }
}

export function localListFollowing(): string[] {
  return read()
}

export function localIsFollowing(userId: string): boolean {
  return read().includes(userId)
}

export function localToggleFollow(userId: string): boolean {
  const set = new Set(read())
  if (set.has(userId)) {
    set.delete(userId)
    write([...set])
    return false
  }
  set.add(userId)
  write([...set])
  return true
}
