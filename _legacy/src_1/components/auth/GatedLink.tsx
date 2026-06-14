import { Link, type LinkProps } from 'react-router-dom'
import { useLoginGate } from '@/context/LoginGateContext'
import { requiresAuthForNavigation } from '@/lib/auth/publicAccess'

type GatedLinkProps = LinkProps & {
  gateHint?: string
  /** When true, always prompt guests (Discover preview links). */
  forceGate?: boolean
}

export function GatedLink({
  to,
  onClick,
  gateHint,
  forceGate,
  children,
  ...rest
}: GatedLinkProps) {
  const { requireAuth, openLoginGate } = useLoginGate()
  const href = typeof to === 'string' ? to : (to.pathname ?? '/')

  return (
    <Link
      to={to}
      {...rest}
      onClick={(e) => {
        const path = href.split('?')[0]?.split('#')[0] ?? href
        const needsAuth = forceGate || requiresAuthForNavigation(path)
        if (needsAuth) {
          const ok = requireAuth(path)
          if (!ok) {
            e.preventDefault()
            if (gateHint) openLoginGate(gateHint)
          }
        }
        onClick?.(e)
      }}
    >
      {children}
    </Link>
  )
}
