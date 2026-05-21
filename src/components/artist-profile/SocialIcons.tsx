import type { ArtistSocialLinks } from '@/lib/artist-profile/types'
import clsx from 'clsx'

const networks = [
  { key: 'spotify' as const, label: 'Spotify' },
  { key: 'youtube' as const, label: 'YouTube' },
  { key: 'instagram' as const, label: 'Instagram' },
  { key: 'facebook' as const, label: 'Facebook' },
  { key: 'bandcamp' as const, label: 'Bandcamp' },
]

interface SocialIconsProps {
  social: ArtistSocialLinks
  className?: string
}

export function SocialIcons({ social, className }: SocialIconsProps) {
  const links = networks.filter((n) => social[n.key])
  if (!links.length && !social.website) return null

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      {social.website && (
        <a
          href={social.website}
          target="_blank"
          rel="noreferrer"
          className="ios-artist-social"
          aria-label="Website"
        >
          WEB
        </a>
      )}
      {links.map(({ key, label }) => (
        <a
          key={key}
          href={social[key]!}
          target="_blank"
          rel="noreferrer"
          className="ios-artist-social"
          aria-label={label}
        >
          {label.slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  )
}
