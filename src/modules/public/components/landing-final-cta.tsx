import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function LandingFinalCta() {
  return (
    <section className="landing-section" aria-label="Join call to action">
      <div className="landing-final-cta">
        <h2 className="landing-final-cta__title">Join the movement</h2>
        <p className="landing-final-cta__sub">
          Create your free account and tap into underground music culture — releases, editorial,
          playlists, and a community that actually listens.
        </p>
        <div className="landing-final-cta__actions">
          <Button asChild size="lg">
            <Link to="/auth/register">Create free account</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/explore">Browse without signing up</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
