import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArtistNavActions } from '@/components/layout/ArtistNavActions'
import type { NavLink } from '@/types'
import clsx from 'clsx'

interface NavbarProps {
  links: NavLink[]
}

export function Navbar({ links }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isArtistSite = /^\/artist\/[^/]+$/.test(location.pathname)

  return (
    <header
      className={clsx(
        'ios-nav fixed top-0 left-0 right-0 z-50 transition-colors',
        isArtistSite
          ? 'ios-nav-artist-site bg-transparent backdrop-blur-none border-b border-transparent'
          : isHome
            ? 'bg-void/50 backdrop-blur-md'
            : 'bg-void/95 backdrop-blur-sm'
      )}
    >
      <nav className="relative flex items-center justify-between px-6 md:px-12 lg:px-16 py-4 md:py-5">
        <Link to="/" className="ios-brand-lockup flex flex-col leading-none group">
          <span className="ios-brand-title font-display text-lg md:text-xl font-extrabold tracking-tight">
            INSTITUTE
          </span>
          <span className="text-[10px] tracking-[0.35em] text-muted uppercase mt-0.5">
            of Sound
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((link) => {
            const active =
              link.href === '/#reviews'
                ? location.hash === '#reviews'
                : location.pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={clsx('ios-nav-link', active && 'ios-nav-link-active')}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
          <li className="hidden lg:block">
            <ArtistNavActions />
          </li>
        </ul>

        <div className="hidden md:flex lg:hidden items-center">
          <ArtistNavActions />
        </div>

        <button
          type="button"
          className="lg:hidden ios-btn ios-btn-ghost !py-2 !px-4"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-void/98 overflow-hidden"
          >
            <ul className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm tracking-widest uppercase font-semibold hover:text-mh-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 mt-2 border-t border-border">
                <p className="text-[10px] tracking-[0.25em] uppercase text-mh-red font-bold mb-3">
                  Artists
                </p>
                <ArtistNavActions layout="stack" onNavigate={() => setOpen(false)} />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
