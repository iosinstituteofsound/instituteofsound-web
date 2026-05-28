import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArtistNavActions } from '@/components/layout/ArtistNavActions'
import { NavDrawerAccordion, NavDropdown } from '@/components/layout/NavDropdown'
import { NavMenuToggle } from '@/components/layout/NavMenuToggle'
import { groupNavLinks } from '@/lib/nav/groupLinks'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath } from '@/lib/auth/roles'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { NetworkNotificationsPanel } from '@/components/community/NetworkNotificationsPanel'
import type { NavGroupId, NavLink } from '@/types'
import clsx from 'clsx'

interface NavbarProps {
  links: NavLink[]
  appMode?: boolean
}

function isLinkActive(href: string, pathname: string, hash: string): boolean {
  if (href === '/#reviews') return hash === '#reviews'
  if (href.startsWith('/#')) return false
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}

function appSectionLabel(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/community')) return 'Community'
  if (pathname.startsWith('/network')) return 'Network'
  if (pathname.startsWith('/academy')) return 'Academy'
  if (pathname.startsWith('/tools')) return 'Toolkit'
  if (pathname.startsWith('/discover')) return 'Discover'
  if (pathname.startsWith('/artist')) return 'Artist'
  return 'Institute of Sound'
}

export function Navbar({ links, appMode = false }: NavbarProps) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false)
  const [openMenu, setOpenMenu] = useState<NavGroupId | null>(null)
  const [drawerSection, setDrawerSection] = useState<NavGroupId | null>('discover')
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isArtistSite = /^\/artist\/[^/]+$/.test(location.pathname)
  const groups = groupNavLinks(links)
  const appLabel = appSectionLabel(location.pathname)

  const linkActive = (href: string) =>
    isLinkActive(href, location.pathname, location.hash)

  const groupActive = (groupId: NavGroupId) => {
    const g = groups.find((x) => x.id === groupId)
    return g?.links.some((l) => linkActive(l.href)) ?? false
  }

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const nextY = window.scrollY
      const delta = nextY - lastY
      setScrolled(nextY > 12)

      if (open) {
        setHiddenOnScroll(false)
      } else if (nextY < 80) {
        setHiddenOnScroll(false)
      } else if (delta > 6) {
        setHiddenOnScroll(true)
      } else if (delta < -6) {
        setHiddenOnScroll(false)
      }

      lastY = nextY
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    if (open) setHiddenOnScroll(false)
  }, [open])

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

  const appQuickLinks: { label: string; href: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Discover', href: '/discover' },
    { label: 'Community Feed', href: '/community#feed' },
    ...(user ? [{ label: 'My Dashboard', href: homeDashboardPath(user.role) }] : []),
    ...(user ? [{ label: 'My Profile', href: `/network/${memberHandleFromUser(user)}` }] : []),
  ]

  return (
    <header
      className={clsx(
        'ios-nav fixed top-0 left-0 right-0 z-50',
        appMode && 'ios-nav-app',
        isArtistSite && 'ios-nav-artist-site',
        !appMode && scrolled && !isArtistSite && 'ios-nav-scrolled',
        !appMode && hiddenOnScroll && 'ios-nav-hidden',
        !appMode && !isArtistSite && !scrolled && isHome && 'ios-nav-home',
        !appMode && !isArtistSite && !isHome && 'ios-nav-solid'
      )}
    >
      <div className="ios-nav-rail" aria-hidden />
      <nav className="ios-nav-inner" aria-label="Main">
        {appMode ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="ios-nav-app-menu-btn"
              aria-label={open ? 'Close app menu' : 'Open app menu'}
            >
              <span className="ios-nav-app-menu-line" />
              <span className="ios-nav-app-menu-line" />
              <span className="ios-nav-app-menu-line" />
            </button>
            <div className="ios-nav-app-title">
              <p className="ios-nav-app-kicker">App</p>
              <p className="ios-nav-app-label">{appLabel}</p>
            </div>
            <div className="ios-nav-app-actions">
              {user && <NetworkNotificationsPanel />}
              {user && (
                <Link
                  to={`/network/${memberHandleFromUser(user)}`}
                  className="ios-nav-app-avatar-link"
                  title="Open profile"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="ios-nav-backdrop"
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
              aria-label={appMode ? 'App menu' : 'Site menu'}
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={clsx('ios-nav-drawer', appMode && 'ios-nav-drawer-app')}
            >
              <div className="ios-nav-drawer-head">
                <p className="ios-nav-drawer-kicker">Navigation</p>
                <p className="ios-nav-drawer-title font-display">
                  {appMode ? 'Open any screen' : 'Enter the archive'}
                </p>
              </div>

              <div className="ios-nav-drawer-body">
                {appMode && (
                  <div className="ios-nav-drawer-app-shortcuts">
                    {appQuickLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setOpen(false)}
                        className={clsx(
                          'ios-nav-drawer-link ios-nav-link',
                          isLinkActive(link.href, location.pathname, location.hash) && 'ios-nav-link-active'
                        )}
                      >
                        <span className="ios-nav-drawer-index">{String(index + 1).padStart(2, '0')}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
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
                {appMode && user ? (
                  <div className="ios-nav-drawer-account-app">
                    <p className="ios-nav-drawer-account-name">{user.name}</p>
                    <p className="ios-nav-drawer-account-role">{user.role.replace('_', ' ')}</p>
                    <div className="ios-nav-drawer-account-actions">
                      <Link
                        to={homeDashboardPath(user.role)}
                        onClick={() => setOpen(false)}
                        className="ios-btn ios-btn-ghost w-full text-center"
                      >
                        Open dashboard
                      </Link>
                      <button
                        type="button"
                        className="ios-btn ios-btn-ghost w-full"
                        onClick={() => {
                          void logout()
                          setOpen(false)
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <ArtistNavActions layout="stack" onNavigate={() => setOpen(false)} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
