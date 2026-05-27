import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges'
import { getLessonOfTheWeek, getOverallAcademyProgress } from '@/lib/academy/academyLoop'
import { isLessonComplete } from '@/lib/academy/progress'

const ACADEMY_CHALLENGE_SLUGS = new Set(['weekly_lesson', 'weekly_study_wire'])

export function AcademyLoopMissions() {
  const { user } = useAuth()
  const { challenges } = useWeeklyChallenges()
  const featured = getLessonOfTheWeek()
  const progress = getOverallAcademyProgress()
  const featuredDone = isLessonComplete(featured.lessonId)

  const academyChallenges = challenges.filter((c) => ACADEMY_CHALLENGE_SLUGS.has(c.slug))

  if (!user) {
    return (
      <section className="academy-loop-missions ios-card">
        <p className="ios-kicker">Academy loop</p>
        <h2 className="font-display text-lg font-bold">Learn → earn dB → post on the wire</h2>
        <p className="text-sm text-muted mt-2">Sign in to sync lessons with weekly network missions.</p>
        <Link to="/login" className="ios-btn ios-btn-metal inline-block mt-4">
          Sign in →
        </Link>
      </section>
    )
  }

  return (
    <section className="academy-loop-missions ios-card" aria-labelledby="academy-loop-heading">
      <p className="ios-kicker">Academy loop</p>
      <h2 id="academy-loop-heading" className="font-display text-xl font-bold">
        This week&apos;s study mission
      </h2>
      <p className="text-sm text-muted mt-1">
        {progress.lessonsDone}/{progress.lessonsTotal} lessons · {progress.quizzesPassed}/
        {progress.quizzesTotal} quizzes passed
      </p>

      <div className="academy-loop-featured">
        <div>
          <p className="academy-loop-featured-kicker">Featured lesson</p>
          <p className="font-display font-bold">{featured.title}</p>
          <p className="text-xs text-muted mt-1 capitalize">{featured.trackSlug.replace(/-/g, ' ')}</p>
        </div>
        <Link
          to={featured.path}
          className={clsx('ios-btn', featuredDone ? 'ios-btn-ghost' : 'ios-btn-metal')}
        >
          {featuredDone ? 'Review lesson' : 'Start lesson →'}
        </Link>
      </div>

      {academyChallenges.length > 0 && (
        <ul className="academy-loop-challenge-list">
          {academyChallenges.map((ch) => (
            <li key={ch.slug} className={clsx(ch.completed && 'academy-loop-challenge-done')}>
              <span>{ch.title}</span>
              <span className="text-muted">+{ch.rewardDb} dB</span>
            </li>
          ))}
        </ul>
      )}

      <div className="academy-loop-actions">
        <Link to="/academy" className="ios-link text-xs uppercase tracking-widest">
          Academy hub →
        </Link>
        <Link to="/community#feed" className="ios-link text-xs uppercase tracking-widest">
          Post a Drop →
        </Link>
      </div>
    </section>
  )
}
