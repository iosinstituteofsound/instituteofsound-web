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
    <nav className="artist-dash-nav" aria-label="Profile sections">
      <p className="artist-dash-nav-label">Sections</p>
      <ul className="artist-dash-nav-list">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => {
                onSelect(s.id)
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={clsx(
                'artist-dash-nav-item',
                activeId === s.id && 'artist-dash-nav-item-active'
              )}
            >
              <span className="artist-dash-nav-item-label">{s.label}</span>
              {s.hint && <span className="artist-dash-nav-item-hint">{s.hint}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
