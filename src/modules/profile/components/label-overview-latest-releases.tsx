import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ExploreReleaseCard } from '@/modules/explore/components/explore-release-card'
import '@/modules/explore/styles/explore.css'
import '@/modules/profile/styles/label-overview-latest-releases.css'

type LabelOverviewLatestReleasesProps = {
  releases: ReleaseDto[]
  viewAllHref?: string
}

export function LabelOverviewLatestReleases({
  releases,
  viewAllHref = '/explore/releases',
}: LabelOverviewLatestReleasesProps) {
  if (releases.length === 0) return null

  return (
    <section className="lbl-ov-latest-rel explore-rel-section" aria-labelledby="lbl-ov-latest-rel-heading">
      <header className="lbl-ov-latest-rel__head">
        <h2 id="lbl-ov-latest-rel-heading" className="lbl-ov-latest-rel__title">
          Latest Releases
        </h2>
        <Link to={viewAllHref} className="lbl-ov-latest-rel__view-all">
          View All Releases
          <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
        </Link>
      </header>

      <div className="explore-rel-track lbl-ov-latest-rel__track">
        {releases.map((release, index) => (
          <ExploreReleaseCard key={release.id} release={release} index={index} />
        ))}
      </div>
    </section>
  )
}
