import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleasesGridCard } from '@/modules/explore/components/releases-grid-card'
import { fillAlbumsPreview } from '@/modules/profile/lib/discography-format'
import '@/modules/explore/styles/releases-page.css'
import '@/modules/profile/styles/disc-catalog-sections.css'

type DiscographyAlbumsEpSectionProps = {
  releases: ReleaseDto[]
  artistName?: string
}

export function DiscographyAlbumsEpSection({ releases, artistName }: DiscographyAlbumsEpSectionProps) {
  const items = fillAlbumsPreview(releases, artistName)
  if (items.length === 0) return null

  return (
    <section className="disc-albums" aria-labelledby="discography-albums-heading">
      <header className="disc-albums__head profile-discography__section-head">
        <p className="disc-albums__kicker profile-discography__section-kicker ios-mh-kicker">
          :: Archive
        </p>
        <h2 id="discography-albums-heading" className="disc-albums__title profile-discography__section-title">
          Albums / EP
        </h2>
      </header>

      <div className="disc-albums__catalog releases-page releases-page--embed">
        <div className="releases-page__grid disc-catalog__grid">
          {items.map((release) => (
            <ReleasesGridCard key={release.id} release={release} className="disc-catalog__card" />
          ))}
        </div>
      </div>
    </section>
  )
}
