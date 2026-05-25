import { Link } from 'react-router-dom'
import { LegalPageShell } from '@/components/legal/LegalPageShell'

const pillars = [
  {
    title: 'Editorial desk',
    body: 'Long-form features, reviews, and scene reporting — underground, cinematic, and experimental music culture documented with weight, not clickbait.',
    href: '/features',
    cta: 'Read features',
  },
  {
    title: 'Artist archive',
    body: 'Bands and solo artists publish live profiles: music, visuals, press kit, and editorial links. Discover is powered by real pages, not a static directory.',
    href: '/discover',
    cta: 'Discover artists',
  },
  {
    title: 'Production academy',
    body: 'Twenty-one infographic lessons across production, mixing, mastering, recording, genres, ear training, and release — with video study lists, quizzes, Ear Lab, and certificates. Zero tuition.',
    href: '/academy',
    cta: 'Open academy',
  },
  {
    title: 'Studio toolkit',
    body: 'Sixteen browser tools — BPM, loudness, chords, vocal chain, export checklist, and more — wired into lesson practice labs so study connects to doing.',
    href: '/tools',
    cta: 'Open toolkit',
  },
]

export default function AboutPage() {
  return (
    <LegalPageShell
      kicker="Who we are"
      title="About Institute of Sound"
      subtitle="Not a blog. A transmission — magazine, archive, school, and workshop for underground music."
    >
      <section className="legal-block legal-manifesto">
        <p className="legal-manifesto-tag">MANIFESTO // IOS</p>
        <p>
          Institute of Sound sits at the intersection of editorial gravity, club immediacy, and
          archive mystique. We document scenes before they surface on algorithmic playlists. We
          train producers who cannot afford $200 courses. We give artists a public home that
          editors can actually link to.
        </p>
      </section>

      <section className="legal-block">
        <h2>What we build</h2>
        <div className="legal-pillar-grid">
          {pillars.map((p) => (
            <article key={p.title} className="legal-pillar-card">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <Link to={p.href} className="legal-pillar-link">
                {p.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="legal-block">
        <h2>How it works</h2>
        <ol className="legal-steps">
          <li>
            <span className="legal-step-n">01</span>
            <div>
              <strong>Artists</strong> sign in with Google, build a profile, and submit tracks for
              editorial review.
            </div>
          </li>
          <li>
            <span className="legal-step-n">02</span>
            <div>
              <strong>Editors</strong> approve submissions, publish reviews and features, and link
              work to artist archives.
            </div>
          </li>
          <li>
            <span className="legal-step-n">03</span>
            <div>
              <strong>Everyone else</strong> reads, listens, learns in the academy, and uses free
              tools — no account required for study.
            </div>
          </li>
        </ol>
      </section>

      <section className="legal-block">
        <h2>Principles</h2>
        <ul className="legal-list">
          <li>Underground first — metal, industrial, ambient, experimental, and adjacent scenes.</li>
          <li>Education accessible — structured curriculum, not random YouTube chaos.</li>
          <li>Real profiles — discover reflects published artist work, not placeholder cards.</li>
          <li>Honest loudness — we teach translation and dynamics, not brickwall vanity.</li>
        </ul>
      </section>
    </LegalPageShell>
  )
}
