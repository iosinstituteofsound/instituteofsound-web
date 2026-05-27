import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { getDbMilestones, getOverallAcademyProgress } from '@/lib/academy/academyLoop'
import { RankBadge } from '@/components/ui/RankBadge'

export function AcademyDbMilestones() {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const progress = getOverallAcademyProgress()
  const totalDb = stats?.totalDb ?? 0
  const milestones = getDbMilestones(totalDb)

  return (
    <section className="academy-db-milestones ios-card">
      <p className="ios-kicker">dB milestones</p>
      <h2 className="font-display text-lg font-bold">Academy fuels your rank</h2>
      <div className="academy-db-milestones-rank">
        <RankBadge rank={milestones.rank} size="md" />
        {milestones.nextRank && (
          <p className="text-sm text-muted">
            {milestones.dbToNext.toLocaleString()} dB to {milestones.nextRank}
          </p>
        )}
      </div>
      <p className="text-xs text-muted mt-2">{milestones.lessonDbPerWeekHint}</p>
      <div className="academy-db-milestones-bar-wrap">
        <div className="ios-tools-meter-track">
          <span
            className="ios-tools-meter-fill"
            style={{ width: `${progress.lessonPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-1">
          Curriculum {progress.lessonPercent}% complete ({progress.lessonsDone} lessons)
        </p>
      </div>
      {user && (
        <Link to="/community" className="ios-link text-xs uppercase tracking-widest mt-4 inline-block">
          Weekly challenges on the network →
        </Link>
      )}
    </section>
  )
}
