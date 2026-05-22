import { useEffect, useState } from 'react'
import clsx from 'clsx'

export interface ArtistSiteNavItem {
  id: string
  label: string
}

interface ArtistSiteStickyNavProps {
  items: ArtistSiteNavItem[]
  artistName: string
}

export function ArtistSiteStickyNav({ items, artistName }: ArtistSiteStickyNavProps) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    if (items.length === 0) return

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="artist-site-nav" aria-label={`${artistName} sections`}>
      <div className="artist-site-nav-inner">
        <span className="artist-site-nav-brand hidden md:block">{artistName}</span>
        <ul className="artist-site-nav-list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={clsx(
                  'artist-site-nav-link',
                  active === item.id && 'artist-site-nav-link-active'
                )}
                onClick={() => setActive(item.id)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
