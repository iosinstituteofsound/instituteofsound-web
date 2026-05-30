import clsx from 'clsx'

export interface ProfileSectionLink {
  id: string
  label: string
  hint?: string
}

interface ArtistProfileSectionNavProps {
  sections: ProfileSectionLink[]
  activeId: string
  onSelect: (id: string) => void
}

export function ArtistProfileSectionNav({
  sections,
  activeId,
  onSelect,
}: ArtistProfileSectionNavProps) {
  return (
    <nav className="artist-dash-section-strip" aria-label="Profile sections">
      <ul className="artist-dash-section-strip-list">
        {sections.map((s) => {
          const active = activeId === s.id
          return (
            <li key={s.id}>
              <button
                type="button"
                title={s.hint}
                onClick={() => {
                  onSelect(s.id)
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={clsx(
                  'artist-dash-section-pill',
                  active && 'artist-dash-section-pill-active',
                )}
              >
                {s.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
