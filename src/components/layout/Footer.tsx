import { Link } from 'react-router-dom'
import type { FooterData } from '@/types'

interface FooterProps {
  data: FooterData
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="border-t border-border section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-2xl font-bold tracking-tight">
              INSTITUTE OF SOUND
            </Link>
            <p className="text-muted mt-4 max-w-md leading-relaxed">{data.manifesto}</p>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] text-rs-red uppercase mb-4 font-semibold">
              Socials
            </h4>
            <ul className="space-y-2">
              {data.socials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted hover:text-signal transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] text-rs-red uppercase mb-4 font-semibold">
              Archive
            </h4>
            <ul className="space-y-2">
              {data.archive.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted hover:text-signal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <h4 className="text-[10px] tracking-[0.3em] text-rs-red uppercase mb-4 font-semibold">
            Newsletter
          </h4>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-lg"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={data.newsletter.placeholder}
              className="flex-1 bg-surface border border-border px-4 py-3 text-sm focus:outline-none focus:border-rs-red transition-colors"
            />
            <button
              type="submit"
              className="bg-rs-red text-white px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-mh-red transition-colors"
            >
              {data.newsletter.cta}
            </button>
          </form>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between gap-4 text-[10px] tracking-widest text-muted uppercase">
          <span>© 2026 Institute of Sound</span>
          <span>Underground Archive // Global Transmission</span>
        </div>
      </div>
    </footer>
  )
}
