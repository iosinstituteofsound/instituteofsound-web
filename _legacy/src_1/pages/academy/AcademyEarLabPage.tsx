import { Link } from 'react-router-dom'
import { EarTrainingLab } from '@/components/academy/EarTrainingLab'
import { EAR_LAB_MODES, EAR_LAB_PASS_SCORE, EAR_LAB_TOTAL_ROUNDS } from '@/lib/academy/earLab'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'
import { AcademySyncBanner } from '@/components/academy/AcademySyncBanner'

export default function AcademyEarLabPage() {
  const { earLab } = useAcademyProgress()

  return (
    <div className="academy-page">
      <div className="academy-page-inner academy-page-inner-narrow">
        <nav className="academy-breadcrumb" aria-label="Breadcrumb">
          <Link to="/academy">Academy</Link>
          <span aria-hidden>/</span>
          <span>Ear Lab</span>
        </nav>

        <header className="academy-lesson-hero">
          <p className="academy-lesson-code">Phase 3 · Interactive</p>
          <h1 className="academy-lesson-title font-display">Ear Lab</h1>
          <p className="academy-lesson-summary">
            Three interactive drills — frequency bands, level/loudness, and compression A/B. Use
            headphones at moderate volume.
          </p>
        </header>

        <AcademySyncBanner />
        <ul className="academy-ear-lab-scores">
          {EAR_LAB_MODES.map((m) => (
            <li key={m.id}>
              {m.label}: {earLab[m.id] ?? 0}/{EAR_LAB_TOTAL_ROUNDS}
              {(earLab[m.id] ?? 0) >= EAR_LAB_PASS_SCORE ? ' ✓' : ''}
            </li>
          ))}
        </ul>
        <EarTrainingLab />
      </div>
    </div>
  )
}
