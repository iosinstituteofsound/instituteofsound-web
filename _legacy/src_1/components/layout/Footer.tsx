import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'
import type { FooterData } from '@/types'

interface FooterProps {
  data: FooterData
}

function FooterLinkList({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="ios-footer-heading">{heading}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith('/') ? (
              <Link to={link.href} className="ios-footer-link">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className="ios-footer-link">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="ios-footer section-padding">
      <div className="max-w-7xl mx-auto pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-12 lg:gap-8">
          <div className="sm:col-span-2 xl:col-span-2">
            <IosBrandLockup to="/" size="sm" />
            <p className="text-muted mt-5 max-w-md leading-relaxed text-sm">{data.manifesto}</p>
          </div>

          {data.explore && data.explore.length > 0 && (
            <FooterLinkList heading="Explore" links={data.explore} />
          )}

          {data.learn && data.learn.length > 0 && (
            <FooterLinkList heading="Learn" links={data.learn} />
          )}

          <FooterLinkList heading="Archive" links={data.archive} />

          <div>
            <h4 className="ios-footer-heading">Socials</h4>
            <ul className="space-y-2.5">
              {data.socials.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="ios-footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="ios-footer-heading">Artists</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="ios-footer-link text-mh-red font-semibold">
                  Sign in with Google →
                </Link>
              </li>
              <li>
                <Link to="/submissions" className="ios-footer-link">
                  Submit music
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-border">
          <h4 className="ios-footer-heading">Newsletter</h4>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-lg"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input type="email" placeholder={data.newsletter.placeholder} className="flex-1" />
            <Button type="submit" variant="primary">
              {data.newsletter.cta}
            </Button>
          </form>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between gap-4 text-[10px] tracking-[0.35em] text-muted uppercase">
          <span>© 2026 Institute of Sound</span>
          <span className="text-mh-red/70">Underground Archive // Global Transmission</span>
        </div>
      </div>
    </footer>
  )
}
