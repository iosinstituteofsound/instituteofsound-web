import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { GrainOverlay } from '@/components/effects/GrainOverlay'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { ManifestoGateModal } from '@/components/ui/ManifestoGateModal'
import { EditorCongratsGate } from '@/components/editor-applications/EditorCongratsGate'
import { AcademyProgressSync } from '@/components/academy/AcademyProgressSync'
import { useLenis } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import { getNav, getFooter } from '@/api/endpoints'

export function Layout() {
  useLenis()
  const location = useLocation()
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
      <ManifestoGateModal />
      <EditorCongratsGate />
      <AcademyProgressSync />
      <GrainOverlay />
      {navLoading ? <div className="h-[4.25rem] md:h-[4.5rem]" /> : navLinks && <Navbar links={navLinks} />}
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
