export function isPrivateLanHost(hostname: string): boolean {
  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  )
}

/** Google Web OAuth only allows localhost/127.0.0.1 or public domains — not 192.168.x.x */
export function isGoogleOAuthSupportedHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (isPrivateLanHost(hostname)) return false
  return true
}

export function getGoogleOAuthBlockedReason(hostname: string): string | null {
  if (isGoogleOAuthSupportedHost(hostname)) return null

  return (
    'Google OAuth does not allow private LAN IPs (like 192.168.x.x) as redirect URIs. ' +
    'On mobile use Dev login below, or use ngrok (public URL), or Android USB with adb reverse to localhost:5173.'
  )
}
