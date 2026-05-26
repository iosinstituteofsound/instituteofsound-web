import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { needsCommunityOnboarding } from '@/lib/community/service'
import {
  CommunityGenreOnboarding,
  isOnboardingDismissed,
} from '@/components/community/CommunityGenreOnboarding'

function shouldOfferOnboarding(pathname: string) {
  if (pathname.startsWith('/desk')) return false
  if (pathname.startsWith('/editor/')) return false
  if (pathname.startsWith('/auth')) return false
  if (pathname.startsWith('/dashboard')) return false
  return true
}

export function CommunityOnboardingGate() {
  const { pathname } = useLocation()
  const { user, loading: authLoading } = useAuth()
  const { stats, loading: statsLoading } = useCommunityMemberStats()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (authLoading || statsLoading) return
    if (!user) return
    if (!shouldOfferOnboarding(pathname)) return
    if (!needsCommunityOnboarding(stats)) return
    if (isOnboardingDismissed()) return

    const t = window.setTimeout(() => setOpen(true), 900)
    return () => window.clearTimeout(t)
  }, [authLoading, statsLoading, user, stats, pathname])

  return <CommunityGenreOnboarding open={open} onClose={() => setOpen(false)} />
}
