import type { ArtistSocialLinks } from '@/lib/artist-profile/types'
import {
  getOrderedSocialLinks,
  type SocialLinkKey,
} from '@/lib/artist-profile/socialOrder'
import clsx from 'clsx'

interface SocialIconsProps {
  social: ArtistSocialLinks
  socialLinkOrder?: SocialLinkKey[]
  className?: string
  variant?: 'default' | 'hero'
}

export function SocialIcons({
  social,
  socialLinkOrder,
  className,
  variant = 'default',
}: SocialIconsProps) {
  const links = getOrderedSocialLinks(social, socialLinkOrder)
  if (links.length === 0) return null

  const linkClass =
    variant === 'hero' ? 'artist-site-social artist-site-social-hero' : 'artist-site-social'

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      {links.map(({ key, href, label, short }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
          aria-label={label}
        >
          {key === 'website' ? (
            <span className="artist-site-social-icon" aria-hidden>
              ↗
            </span>
          ) : (
            <span className="artist-site-social-badge" aria-hidden>
              {short}
            </span>
          )}
          {variant === 'hero' ? label : key === 'website' ? 'WEB' : short}
        </a>
      ))}
    </div>
  )
}
