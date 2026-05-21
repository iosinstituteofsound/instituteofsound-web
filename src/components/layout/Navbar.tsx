import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { MetalButton } from '@/components/ui/MetalButton'
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
        'fixed top-0 left-0 right-0 z-50 metal-nav transition-colors',
        isHome ? 'bg-void/50 backdrop-blur-md' : 'bg-void/95 backdrop-blur-sm'
      )}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-4 md:py-5">
        <Link to="/" className="flex items-center gap-3 group">
          <span
            className="hidden sm:flex w-9 h-9 items-center justify-center font-metal text-lg text-mh-red border border-mh-red/40 bg-mh-red/5 group-hover:bg-mh-red/15 transition-colors"
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            †
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-metal text-xl md:text-2xl tracking-wide text-signal group-hover:text-mh-red transition-colors">
              INSTITUTE
            </span>
            <span className="text-[9px] tracking-[0.4em] text-muted uppercase mt-0.5">
              of Sound
            </span>
          </div>
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
                  className={clsx('metal-nav-link', active && 'is-active')}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}

          {user ? (
            <>
              <li>
                <MetalButton
                  to={dashboardHref}
                  variant={isSuperEditor ? 'rs' : 'primary'}
                  className="!text-[10px]"
                >
                  {isSuperEditor
                    ? 'Super Editor'
                    : user.role === 'editor'
                      ? 'Editor Desk'
                      : 'My Tracks'}
                </MetalButton>
              </li>
              <li>
                <button
                  type="button"
                  onClick={logout}
                  className="metal-nav-link !text-muted hover:!text-signal bg-transparent border-0 cursor-pointer p-0"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="metal-nav-link">
                  Login
                </Link>
              </li>
              <li>
                <MetalButton to="/register" variant="primary" className="!text-[10px]">
                  Join
                </MetalButton>
              </li>
            </>
          )}
        </ul>

        <button
          type="button"
          className="lg:hidden metal-btn metal-btn-ghost !p-0"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="metal-btn-inner !py-2 !px-4 !text-[10px]">
            {open ? 'Close' : 'Menu'}
          </span>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-mh-red/20 bg-void/98 overflow-hidden">
          <ul className="flex flex-col p-6 gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-sm tracking-widest uppercase font-bold hover:text-mh-red transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <MetalButton to={dashboardHref} variant="primary" onClick={() => setOpen(false)}>
                    Dashboard
                  </MetalButton>
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
                  <MetalButton to="/register" variant="primary" onClick={() => setOpen(false)}>
                    Join
                  </MetalButton>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
