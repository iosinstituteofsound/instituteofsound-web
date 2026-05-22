import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { GrainOverlay } from '@/components/effects/GrainOverlay'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { ManifestoGateModal } from '@/components/ui/ManifestoGateModal'
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

  return (
    <>
      <ManifestoGateModal />
      <GrainOverlay />
      {navLoading ? <div className="h-[72px]" /> : navLinks && <Navbar links={navLinks} />}
      <main className="ios-page-bg">
        <Outlet />
      </main>
      {footerLoading ? <LoadingTransmission variant="compact" /> : footerData && <Footer data={footerData} />}
    </>
  )
}
