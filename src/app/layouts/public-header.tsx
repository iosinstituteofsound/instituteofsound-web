import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Sheet } from '@/shared/components/ui/sheet'
import type { LayoutNavLink } from '@/shared/types/layout.types'
import { cn } from '@/shared/lib/cn'

interface PublicHeaderProps {
  brand: string
  navLinks: LayoutNavLink[]
  showAuthButtons: boolean
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn('public-header__nav-link', isActive && 'public-header__nav-link--active')
}

export function PublicHeader({ brand, navLinks, showAuthButtons }: PublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link to="/" className="public-header__brand" onClick={closeMenu}>
          <img src="/pwa/icon-master.svg" alt="" className="public-header__logo" />
          <span className="public-header__brand-text">
            <span className="public-header__brand-mark">IOS</span>
            <span className="public-header__brand-name">{brand}</span>
          </span>
        </Link>

        <nav className="public-header__nav" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink key={link.href} to={link.href} className={navLinkClass} end={link.href === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="public-header__actions">
          {showAuthButtons ? (
            <div className="public-header__auth public-header__auth--desktop">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth/register">Join free</Link>
              </Button>
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="public-header__menu-btn"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} aria-hidden />
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav className="public-header__drawer" aria-label="Mobile">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={navLinkClass}
              end={link.href === '/'}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
          {showAuthButtons ? (
            <div className="public-header__drawer-auth">
              <Button variant="secondary" asChild className="w-full">
                <Link to="/auth/login" onClick={closeMenu}>
                  Sign in
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/auth/register" onClick={closeMenu}>
                  Join free
                </Link>
              </Button>
            </div>
          ) : null}
        </nav>
      </Sheet>
    </header>
  )
}
