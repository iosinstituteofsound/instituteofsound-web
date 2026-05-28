import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
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
  const { user } = useAuth()
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

  return (
    <>
      <GlobalJsonLd />
      <RouteSeo />
      <ManifestoGateModal />
      <EditorCongratsGate />
      <AcademyProgressSync />
      <CommunityOnboardingGate />
      <GrainOverlay />
      {navLoading ? (
        <div className="h-[4.25rem] md:h-[4.5rem]" />
      ) : (
        navLinks && <Navbar links={navLinks} appMode={Boolean(user)} />
      )}
      <main className="ios-page-bg">
        <Outlet />
      </main>
      {!isArtistSite &&
        (footerLoading ? (
          <LoadingTransmission variant="compact" />
        ) : (
          footerData && <Footer data={footerData} />
        ))}
    </>
  )
}
