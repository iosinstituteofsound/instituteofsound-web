import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleasesGridCard } from '@/modules/explore/components/releases-grid-card'
import { fillSinglesPreview } from '@/modules/profile/lib/discography-format'
import '@/modules/explore/styles/releases-page.css'
import '@/modules/profile/styles/disc-catalog-sections.css'

type DiscographySinglesSectionProps = {
  releases: ReleaseDto[]
  artistName?: string
}

export function DiscographySinglesSection({ releases, artistName }: DiscographySinglesSectionProps) {
  const items = fillSinglesPreview(releases, artistName)
  if (items.length === 0) return null

  return (
    <section className="disc-singles" aria-labelledby="discography-singles-heading">
      <header className="disc-singles__head profile-discography__section-head">
        <p className="disc-singles__kicker profile-discography__section-kicker ios-mh-kicker">
          :: Transmissions
        </p>
        <h2 id="discography-singles-heading" className="disc-singles__title profile-discography__section-title">
          Singles
        </h2>
      </header>

      <div className="disc-singles__catalog releases-page releases-page--embed">
        <div className="releases-page__grid disc-catalog__grid">
          {items.map((release) => (
            <ReleasesGridCard key={release.id} release={release} className="disc-catalog__card" />
          ))}
        </div>
      </div>
    </section>
  )
}
