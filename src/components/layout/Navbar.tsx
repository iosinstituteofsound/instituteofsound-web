import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import type { NavLink } from '@/types'
import clsx from 'clsx'

interface NavbarProps {
  links: NavLink[]
}

export function Navbar({ links }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isSuperEditor } = useAuth()
  const isHome = location.pathname === '/'

  const dashboardHref = user ? editorDashboardPath(user.role) : '/login'

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-colors',
        isHome
          ? 'bg-void/40 backdrop-blur-md border-b border-border/40'
          : 'bg-void/95 backdrop-blur-sm border-b border-border'
      )}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-4 md:py-5">
        <Link to="/" className="flex flex-col leading-none group">
          <span className="font-display text-lg md:text-xl font-extrabold tracking-tight group-hover:text-rs-red transition-colors">
            INSTITUTE
          </span>
          <span className="text-[10px] tracking-[0.35em] text-muted uppercase">
            of Sound
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-6">
          {links.map((link) => {
            const active =
              link.href === '/#reviews'
                ? location.hash === '#reviews'
                : location.pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={clsx(
                    'text-xs tracking-[0.12em] uppercase font-medium transition-colors hover:text-rs-red',
                    active ? 'text-rs-red' : 'text-signal/75'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}

          {user ? (
            <>
              <li>
                <Link
                  to={dashboardHref}
                  className={clsx(
                    'text-xs tracking-[0.12em] uppercase font-bold px-4 py-2 transition-colors',
                    isSuperEditor
                      ? 'bg-gradient-to-r from-rs-red to-mh-red text-white'
                      : user.role === 'editor'
                        ? 'bg-rs-red text-white hover:bg-mh-red'
                        : 'bg-mh-red text-white hover:bg-rs-red'
                  )}
                >
                  {isSuperEditor
                    ? 'Super Editor'
                    : user.role === 'editor'
                      ? 'Editor Desk'
                      : 'My Tracks'}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs tracking-[0.12em] uppercase text-muted hover:text-signal"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="text-xs tracking-[0.12em] uppercase text-muted hover:text-rs-red"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-xs tracking-[0.12em] uppercase bg-mh-red text-white px-4 py-2 font-bold hover:bg-rs-red transition-colors"
                >
                  Join
                </Link>
              </li>
            </>
          )}
        </ul>

        <button
          type="button"
          className="lg:hidden text-xs tracking-widest uppercase font-bold text-rs-red"
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
            className="lg:hidden border-t border-border bg-void overflow-hidden"
          >
            <ul className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm tracking-widest uppercase font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li>
                    <Link
                      to={dashboardHref}
                      onClick={() => setOpen(false)}
                      className="text-sm tracking-widest uppercase font-bold text-rs-red"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setOpen(false)
                      }}
                      className="text-sm tracking-widest uppercase text-muted"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="text-sm tracking-widest uppercase"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="text-sm tracking-widest uppercase text-mh-red font-bold"
                    >
                      Join
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
