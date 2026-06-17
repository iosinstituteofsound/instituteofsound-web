import { Link } from 'react-router-dom'
import { Disc3, Headphones, Mic2, PenLine } from 'lucide-react'

const ROLES = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Release music, submit tracks, and build your underground profile.',
    icon: Mic2,
  },
  {
    id: 'editor',
    title: 'Editor',
    description: 'Curate editorial, wire picks, and shape the cultural narrative.',
    icon: PenLine,
  },
  {
    id: 'listener',
    title: 'Listener',
    description: 'Discover releases, rank on leaderboards, and join the scene.',
    icon: Headphones,
  },
  {
    id: 'curator',
    title: 'Curator',
    description: 'Build playlists, spotlight artists, and guide the underground.',
    icon: Disc3,
  },
] as const

export function LandingJoinSection() {
  return (
    <section className="landing-section" aria-labelledby="landing-join-title">
      <header className="landing-section-head">
        <div>
          <p className="landing-section-head__num">05</p>
          <p className="landing-section-head__kicker">Roles</p>
          <h2 id="landing-join-title" className="landing-section-head__title">
            Find your place in the movement
          </h2>
          <p className="landing-section-head__sub">
            Whether you create, curate, edit, or listen — there is a lane for you.
          </p>
        </div>
      </header>

      <div className="landing-join__grid">
        {ROLES.map((role) => {
          const Icon = role.icon
          return (
            <Link
              key={role.id}
              to="/auth/register"
              className="landing-join__card"
            >
              <span className="landing-join__icon">
                <Icon size={18} aria-hidden />
              </span>
              <p className="landing-join__role">{role.title}</p>
              <p className="landing-join__desc">{role.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
