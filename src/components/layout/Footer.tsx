import { Link } from 'react-router-dom'
import { MetalButton } from '@/components/ui/MetalButton'
import { MetalInput } from '@/components/ui/MetalInput'
import type { FooterData } from '@/types'

interface FooterProps {
  data: FooterData
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="metal-footer section-padding section-perf">
      <div className="max-w-7xl mx-auto pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block group">
              <span className="font-metal text-3xl md:text-4xl tracking-wide text-signal group-hover:text-mh-red transition-colors">
                INSTITUTE OF SOUND
              </span>
            </Link>
            <p className="text-muted mt-4 max-w-md leading-relaxed text-sm md:text-base">
              {data.manifesto}
            </p>
            <div className="flex gap-2 mt-6">
              <span className="metal-badge metal-badge-dark">Underground</span>
              <span className="metal-badge">No Pop</span>
            </div>
          </div>

          <div>
            <h4 className="metal-kicker text-rs-red mb-4">Socials</h4>
            <ul className="space-y-3">
              {data.socials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted hover:text-mh-red transition-colors uppercase tracking-wider"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="metal-kicker text-rs-red mb-4">Archive</h4>
            <ul className="space-y-3">
              {data.archive.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted hover:text-mh-red transition-colors uppercase tracking-wider"
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-border/80">
          <h4 className="metal-kicker mb-4">Newsletter</h4>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-lg"
            onSubmit={(e) => e.preventDefault()}
          >
            <MetalInput type="email" placeholder={data.newsletter.placeholder} className="flex-1" />
            <MetalButton type="submit" variant="rs">
              {data.newsletter.cta}
            </MetalButton>
          </form>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between gap-4 text-[10px] tracking-[0.35em] text-muted uppercase">
          <span>© 2026 Institute of Sound</span>
          <span className="text-mh-red/60">† Underground Archive // Global Transmission</span>
        </div>
      </div>
    </footer>
  )
}
