import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  ACADEMY_HUB_STATS,
  ACADEMY_PHASE_1_TRACKS,
  ACADEMY_PHASE_2_TRACKS,
  ACADEMY_PHASE_3_TRACKS,
  ACADEMY_QUIZZES,
  getLessonsForTrack,
} from '@/lib/academy/registry'
import { getEarnedCertificateCount } from '@/lib/academy/certificates'
import { AcademyHubContinue, AcademyHubSearch } from '@/components/academy/AcademyHubControls'
import { AcademySyncBanner } from '@/components/academy/AcademySyncBanner'
import { AcademyDbMilestones } from '@/components/academy/AcademyDbMilestones'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'

function TrackGrid({
  tracks,
  completedSet,
}: {
  tracks: typeof ACADEMY_PHASE_1_TRACKS
  completedSet: Set<string>
}) {
  return (
    <div className="academy-track-grid">
      {tracks.map((track) => {
        const lessons = getLessonsForTrack(track.slug)
        const first = lessons[0]
        const trackDone = lessons.filter((l) => completedSet.has(l.id)).length
        return (
          <article key={track.slug} className="academy-track-card">
            <p className="academy-track-phase">{track.phase}</p>
            <h3 className="academy-track-title">{track.title}</h3>
            <p className="academy-track-desc">{track.description}</p>
            <p className="academy-track-meta">
              {track.moduleCount} lessons · {track.readTime} total
              {trackDone > 0 && ` · ${trackDone}/${lessons.length} done`}
            </p>
            <ul className="academy-track-list">
              {lessons.map((m) => (
                <li key={m.id}>
                  <span>{m.id}</span>
                  <Link to={`/academy/${track.slug}/${m.slug}`}>{m.title}</Link>
                </li>
              ))}
            </ul>
            <div className="academy-track-actions">
              <Link to={`/academy/${track.slug}`} className="ios-btn ios-btn-ghost academy-track-cta">
                Track overview
              </Link>
              {first && (
                <Link
                  to={`/academy/${track.slug}/${first.slug}`}
                  className="ios-btn ios-btn-metal academy-track-cta"
                >
                  Start lesson 1
                </Link>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default function AcademyHubPage() {
  const { completedLessons, quizScores } = useAcademyProgress()
  const completed = completedLessons.length
  const completedSet = new Set(completedLessons)
  const quizPassed = ACADEMY_QUIZZES.filter((q) => {
    const best = quizScores[q.id]
    return typeof best === 'number' && best >= q.passPercent
  }).length
  const certsEarned = getEarnedCertificateCount()

  return (
    <div className="section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Academy · Phases 1–3"
          title="Music Production Academy"
          subtitle="Infographic lessons, track quizzes, interactive Ear Lab, and printable certificates — built for students, zero login."
          align="center"
          titleAs="h1"
        />

        <AcademySyncBanner />

        <AcademyDbMilestones />

        <div className="academy-hub-controls">
          <AcademyHubContinue />
          <AcademyHubSearch />
        </div>

        <div className="academy-stats-row">
          {ACADEMY_HUB_STATS.map((s) => (
            <div key={s.label} className="academy-stat-card">
              <span className="academy-stat-value">{s.value}</span>
              <span className="academy-stat-label">{s.label}</span>
            </div>
          ))}
          {completed > 0 && (
            <div className="academy-stat-card academy-stat-card-accent">
              <span className="academy-stat-value">{completed}</span>
              <span className="academy-stat-label">Lessons done</span>
            </div>
          )}
          {quizPassed > 0 && (
            <div className="academy-stat-card academy-stat-card-accent">
              <span className="academy-stat-value">{quizPassed}</span>
              <span className="academy-stat-label">Quizzes passed</span>
            </div>
          )}
          {certsEarned > 0 && (
            <div className="academy-stat-card academy-stat-card-accent">
              <span className="academy-stat-value">{certsEarned}</span>
              <span className="academy-stat-label">Certificates</span>
            </div>
          )}
        </div>

        <div className="academy-phase-banner-row">
          <div className="academy-phase-banner">
            <div>
              <p className="academy-phase-banner-k">Quizzes</p>
              <p className="academy-phase-banner-t">Test yourself after each track.</p>
            </div>
            <Link to="/academy/quizzes" className="ios-btn ios-btn-ghost">
              Open quizzes →
            </Link>
          </div>
          <div className="academy-phase-banner academy-phase-banner-accent">
            <div>
              <p className="academy-phase-banner-k">Phase 3 · Ear Lab & certificates</p>
              <p className="academy-phase-banner-t">Train frequency hearing and unlock printable certs.</p>
            </div>
            <div className="academy-phase-banner-btns">
              <Link to="/academy/ear-lab" className="ios-btn ios-btn-metal">
                Ear Lab →
              </Link>
              <Link to="/academy/certificates" className="ios-btn ios-btn-ghost">
                Certificates
              </Link>
            </div>
          </div>
        </div>

        <h2 className="academy-phase-heading">Phase 1 · Core curriculum</h2>
        <TrackGrid tracks={ACADEMY_PHASE_1_TRACKS} completedSet={completedSet} />

        <h2 className="academy-phase-heading academy-phase-heading-2">Phase 2 · Recording & genres</h2>
        <TrackGrid tracks={ACADEMY_PHASE_2_TRACKS} completedSet={completedSet} />

        <h2 className="academy-phase-heading academy-phase-heading-2">Phase 3 · Ear training & release</h2>
        <TrackGrid tracks={ACADEMY_PHASE_3_TRACKS} completedSet={completedSet} />

        <p className="text-xs text-muted mt-12 max-w-2xl mx-auto text-center leading-relaxed">
          Progress saves in your browser. Toolkit links in practice labs connect lessons to hands-on
          tools.
        </p>
      </div>
    </div>
  )
}
