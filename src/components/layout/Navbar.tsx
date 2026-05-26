import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArtistNavActions } from '@/components/layout/ArtistNavActions'
import { NavDrawerAccordion, NavDropdown } from '@/components/layout/NavDropdown'
import { NavMenuToggle } from '@/components/layout/NavMenuToggle'
import { groupNavLinks } from '@/lib/nav/groupLinks'
import type { NavGroupId, NavLink } from '@/types'
import clsx from 'clsx'

interface NavbarProps {
  links: NavLink[]
}

function isLinkActive(href: string, pathname: string, hash: string): boolean {
  if (href === '/#reviews') return hash === '#reviews'
  if (href.startsWith('/#')) return false
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}

export function Navbar({ links }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<NavGroupId | null>(null)
  const [drawerSection, setDrawerSection] = useState<NavGroupId | null>('discover')
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isArtistSite = /^\/artist\/[^/]+$/.test(location.pathname)
  const groups = groupNavLinks(links)

  const linkActive = (href: string) =>
    isLinkActive(href, location.pathname, location.hash)

  const groupActive = (groupId: NavGroupId) => {
    const g = groups.find((x) => x.id === groupId)
    return g?.links.some((l) => linkActive(l.href)) ?? false
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setOpenMenu(null)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={clsx(
        'ios-nav fixed top-0 left-0 right-0 z-50',
        isArtistSite && 'ios-nav-artist-site',
        scrolled && !isArtistSite && 'ios-nav-scrolled',
        !isArtistSite && !scrolled && isHome && 'ios-nav-home',
        !isArtistSite && !isHome && 'ios-nav-solid'
      )}
    >
      <div className="ios-nav-rail" aria-hidden />
      <nav className="ios-nav-inner" aria-label="Main">
        <Link to="/" className="ios-brand-lockup group flex flex-col leading-none">
          <span className="ios-brand-title font-display text-lg md:text-xl font-extrabold tracking-tight">
            INSTITUTE
          </span>
          <span className="ios-brand-sub text-[10px] tracking-[0.35em] text-muted uppercase mt-0.5">
            of Sound
          </span>
        </Link>

        <ul
          className="ios-nav-mega hidden lg:flex"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {groups.map((group) => (
            <NavDropdown
              key={group.id}
              group={group}
              open={openMenu === group.id}
              onOpen={() => setOpenMenu(group.id)}
              onClose={() => setOpenMenu(null)}
              isLinkActive={linkActive}
              groupActive={groupActive(group.id)}
            />
          ))}
        </ul>

        <div className="ios-nav-actions hidden lg:flex">
          <ArtistNavActions />
        </div>

        <div className="ios-nav-mobile-cta hidden md:flex lg:hidden">
          <ArtistNavActions />
        </div>

        <div className="ios-nav-toggle-wrap">
          <NavMenuToggle open={open} onClick={() => setOpen((v) => !v)} />
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="ios-nav-backdrop lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="ios-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="ios-nav-drawer lg:hidden"
            >
              <div className="ios-nav-drawer-head">
                <p className="ios-nav-drawer-kicker">Navigation</p>
                <p className="ios-nav-drawer-title font-display">Enter the archive</p>
              </div>

              <div className="ios-nav-drawer-body">
                {groups.map((group) => (
                  <NavDrawerAccordion
                    key={group.id}
                    group={group}
                    expanded={drawerSection === group.id}
                    onToggle={() =>
                      setDrawerSection((cur) => (cur === group.id ? null : group.id))
                    }
                    isLinkActive={linkActive}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>

              <div className="ios-nav-drawer-foot">
                <p className="ios-nav-drawer-foot-label">Account</p>
                <ArtistNavActions layout="stack" onNavigate={() => setOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
