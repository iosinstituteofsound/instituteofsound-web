import { type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Instagram, Music2, Youtube } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { LayoutFooterLinkGroup } from '@/shared/types/layout.types'

const FOOTER_TAGLINE =
  'Underground music magazine and platform — culture built, not posted.'

const FOOTER_TRANSMISSION = 'Underground Archive // Global Transmission'

const FOOTER_SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/instituteofsound', Icon: Instagram },
  { label: 'YouTube', href: 'https://youtube.com/@instituteofsound', Icon: Youtube },
  { label: 'SoundCloud', href: 'https://soundcloud.com/instituteofsound', Icon: Music2 },
] as const

const FOOTER_VALUE_PROPS = [
  { title: 'Editorial depth', desc: 'Long-form culture, not algorithm filler.' },
  { title: 'Artist-first', desc: 'Profiles, releases, and real reach.' },
  { title: 'Underground signal', desc: 'A community that actually listens.' },
] as const

const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const

interface PublicFooterProps {
  brand: string
  copyright: string
  linkGroups: LayoutFooterLinkGroup[]
}

function FooterLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith('http')) {
    return (
      <a href={href} className="public-footer__link" target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    )
  }

  return (
    <Link to={href} className="public-footer__link">
      {label}
    </Link>
  )
}

export function PublicFooter({ brand, copyright, linkGroups }: PublicFooterProps) {
  const handleNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <footer className="public-footer">
      <div className="public-footer__accent" aria-hidden />

      <div className="public-footer__newsletter">
        <div className="public-footer__newsletter-inner">
          <div className="public-footer__newsletter-copy">
            <p className="public-footer__newsletter-kicker">Transmission</p>
            <h2 className="public-footer__newsletter-title">Stay on frequency</h2>
            <p className="public-footer__newsletter-desc">
              Weekly drops — premieres, editorial picks, and underground releases before they
              surface anywhere else.
            </p>
          </div>
          <form className="public-footer__newsletter-form" onSubmit={handleNewsletter}>
            <Input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              aria-label="Email address"
              className="public-footer__newsletter-input"
            />
            <Button type="submit" className="public-footer__newsletter-btn">
              Subscribe
              <ArrowRight size={16} aria-hidden />
            </Button>
          </form>
        </div>
      </div>

      <div className="public-footer__inner">
        <div className="public-footer__main">
          <div className="public-footer__brand-col">
            <Link to="/" className="public-footer__brand">
              <img src="/pwa/icon-master.svg" alt="" className="public-header__logo" />
              <div>
                <p className="public-footer__brand-mark">IOS</p>
                <p className="public-footer__brand-name">{brand}</p>
              </div>
            </Link>
            <p className="public-footer__tagline">{FOOTER_TAGLINE}</p>

            <div className="public-footer__socials">
              {FOOTER_SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="public-footer__social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={18} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.length > 0 ? (
            <div className="public-footer__groups">
              {linkGroups.map((group) => (
                <div key={group.title} className="public-footer__group">
                  <p className="public-footer__group-title">{group.title}</p>
                  <ul className="public-footer__links">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <FooterLink href={link.href} label={link.label} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="public-footer__value-props">
          {FOOTER_VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="public-footer__value-prop">
              <p className="public-footer__value-prop-title">{prop.title}</p>
              <p className="public-footer__value-prop-desc">{prop.desc}</p>
            </div>
          ))}
        </div>

        <div className="public-footer__bottom">
          <p className="public-footer__copy">{copyright}</p>
          <nav className="public-footer__legal" aria-label="Legal">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
          <p className="public-footer__transmission">{FOOTER_TRANSMISSION}</p>
        </div>
      </div>
    </footer>
  )
}
