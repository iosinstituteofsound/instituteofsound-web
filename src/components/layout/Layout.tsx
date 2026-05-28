import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { GrainOverlay } from '@/components/effects/GrainOverlay'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { ManifestoGateModal } from '@/components/ui/ManifestoGateModal'
import { EditorCongratsGate } from '@/components/editor-applications/EditorCongratsGate'
import { AcademyProgressSync } from '@/components/academy/AcademyProgressSync'
import { CommunityOnboardingGate } from '@/components/community/CommunityOnboardingGate'
import { GlobalJsonLd } from '@/components/seo/GlobalJsonLd'
import { RouteSeo } from '@/components/seo/RouteSeo'
import { useLenis } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import { getNav, getFooter } from '@/api/endpoints'
import { useAuth } from '@/context/AuthContext'

export function Layout() {
  useLenis()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const appMode = Boolean(user)
  const fetchNav = useCallback(() => getNav(), [])
  const fetchFooter = useCallback(() => getFooter(), [])
  const { data: navLinks, loading: navLoading } = useContent(fetchNav)
  const { data: footerData, loading: footerLoading } = useContent(fetchFooter)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash, location.pathname])

  const isArtistSite = /^\/artist\/[^/]+$/.test(location.pathname)

  useEffect(() => {
    document.body.classList.toggle('ios-app-shell', appMode)
    return () => document.body.classList.remove('ios-app-shell')
  }, [appMode])

  return (
    <>
      <GlobalJsonLd />
      <RouteSeo />
      <ManifestoGateModal />
      <EditorCongratsGate />
      <AcademyProgressSync />
      <CommunityOnboardingGate />
      <GrainOverlay />
      {navLoading || authLoading ? (
        <div className="h-[4.25rem] md:h-[4.5rem]" />
      ) : (
        navLinks && <Navbar links={navLinks} appMode={appMode} />
      )}
      <main className={clsx('ios-page-bg', appMode && 'ios-app-shell-main')}>
        <Outlet />
      </main>
      {!isArtistSite && !user &&
        (footerLoading ? (
          <LoadingTransmission variant="compact" />
        ) : (
          footerData && <Footer data={footerData} />
        ))}
    </>
  )
}
