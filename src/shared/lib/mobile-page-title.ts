export function resolveMobilePageTitle(pathname: string): string {
  if (pathname === '/home' || pathname === '/feed' || pathname.startsWith('/feed/')) {
    return 'Feed'
  }
  if (pathname === '/reels' || pathname.startsWith('/reels/')) {
    return 'Reels'
  }
  if (pathname === '/explore' || pathname.startsWith('/explore/')) {
    return 'Explore'
  }
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return 'Dashboard'
  }
  if (pathname.startsWith('/profile')) {
    return 'Profile'
  }
  if (pathname.startsWith('/music')) {
    return 'Music'
  }
  if (pathname.startsWith('/editor')) {
    return 'Editor'
  }
  if (pathname.startsWith('/artist')) {
    return 'Artist'
  }

  const segment = pathname.split('/').filter(Boolean)[0]
  if (!segment) return 'Home'

  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}
