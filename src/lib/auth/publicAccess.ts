/** Routes guests may open without signing in (browse + navigate). */
const PUBLIC_PREFIXES = ['/tools', '/academy', '/login', '/register', '/auth', '/desk', '/privacy', '/about', '/contact', '/editor/join']

export function isPublicPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '') return true
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** Guest may view Discover layout; leaving it to other routes needs sign-in. */
export function isDiscoverPreviewPath(pathname: string): boolean {
  return pathname === '/discover' || pathname.startsWith('/discover?')
}

export function requiresAuthForNavigation(pathname: string): boolean {
  if (isPublicPath(pathname)) return false
  if (isDiscoverPreviewPath(pathname)) return false
  return true
}
