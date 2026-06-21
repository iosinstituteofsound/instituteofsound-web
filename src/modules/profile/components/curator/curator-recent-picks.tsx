import { Link } from 'react-router-dom'
import type { CuratorRecentPickDto } from '@/modules/explore/types/explore.types'
import { curatorShortDate } from '@/modules/profile/lib/curator-format'
import { CuratorGlassSection } from '@/modules/profile/components/curator/curator-glass-section'

type CuratorRecentPicksProps = {
  picks: CuratorRecentPickDto[]
  viewAllHref?: string
}

export function CuratorRecentPicks({ picks, viewAllHref = '/curator/picks' }: CuratorRecentPicksProps) {
  if (picks.length === 0) return null

  return (
    <CuratorGlassSection
      title="Recent Picks"
      id="curator-recent-picks-heading"
      viewAllHref={viewAllHref}
      viewAllLabel="View all"
      className="curator-picks"
    >
      <ul className="curator-picks__list">
        {picks.map((pick) => {
          const href = pick.reviewSlug ? `/explore/articles/${pick.reviewSlug}` : '/curator/picks'

          return (
            <li key={pick.id}>
              <Link to={href} className="curator-picks__item">
                {pick.coverUrl ? (
                  <img src={pick.coverUrl} alt="" loading="lazy" className="curator-picks__thumb" />
                ) : (
                  <span className="curator-picks__thumb curator-picks__thumb--empty" aria-hidden />
                )}
                <div className="curator-picks__copy">
                  <p className="curator-picks__label">Signal · {pick.pickNumber}</p>
                  <p className="curator-picks__artist">{pick.artistName}</p>
                  <p className="curator-picks__note">&ldquo;{pick.note}&rdquo;</p>
                  <p className="curator-picks__date">{curatorShortDate(pick.publishedAt)}</p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </CuratorGlassSection>
  )
}
