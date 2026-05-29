import type { MouseEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLoginGate } from '@/context/LoginGateContext'
import { requiresAuthForNavigation } from '@/lib/auth/publicAccess'

function pathFromHref(href: string): string {
  if (href.startsWith('/#') || href.startsWith('#')) return '/'
  if (href.startsWith('http')) {
    try {
      return new URL(href).pathname
    } catch {
      return href
    }
  }
  return href.split('?')[0]?.split('#')[0] ?? href
}

export function useNavGate() {
  const { user, loading } = useAuth()
  const { requireAuth } = useLoginGate()

  const guardNavClick = (e: MouseEvent, href: string, onAllowed?: () => void) => {
    const path = pathFromHref(href)
    if (!loading && !user && requiresAuthForNavigation(path)) {
      e.preventDefault()
      requireAuth(path)
      return
    }
    onAllowed?.()
  }

  return { guardNavClick, isGuest: !user && !loading }
}
