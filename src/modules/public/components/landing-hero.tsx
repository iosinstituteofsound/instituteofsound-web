import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { env } from '@/shared/config/env'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import { articleCategory } from '@/modules/explore/lib/editorial-meta'

const MARQUEE_ITEMS = [
  'New releases',
  'Editorial picks',
  'Scene hubs',
  'Underground playlists',
  'Listener rankings',
  'Live events',
]

interface LandingHeroProps {
  coverStory: ArticleDto | null
}

export function LandingHero({ coverStory }: LandingHeroProps) {
  return (
    <section className="landing-hero">
      <div className="landing-hero__marquee" aria-hidden>
        <div className="landing-hero__marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} className="landing-hero__marquee-item">
              {item}
              <span className="mx-6 text-primary">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="landing-hero__grid">
        <div>
          <p className="landing-hero__kicker">{env.appName} presents</p>
          <h1 className="landing-hero__title">
            Underground music culture,
            <br />
            <span className="landing-hero__accent">built not posted.</span>
          </h1>
          <p className="landing-hero__dek">
            A magazine-grade platform for artists, editors, curators, and listeners — discover
            what is moving underground right now.
          </p>
          {coverStory ? (
            <p className="landing-hero__cover-title">Now reading: {coverStory.title}</p>
          ) : null}
          <div className="landing-hero__actions">
            <Button asChild size="lg">
              <Link to="/auth/register">Join free</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/explore">Explore the network</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>

        {coverStory ? (
          <Link to={`/explore/articles/${coverStory.slug}`} className="landing-hero__visual">
            {coverStory.coverUrl ? (
              <img src={coverStory.coverUrl} alt="" loading="eager" />
            ) : null}
            <div className="landing-hero__visual-scrim" aria-hidden />
            <div className="landing-hero__visual-body">
              <span className="landing-hero__visual-tag">{articleCategory(coverStory)}</span>
              <p className="landing-hero__visual-headline">{coverStory.title}</p>
            </div>
          </Link>
        ) : (
          <div className="landing-hero__visual" aria-hidden />
        )}
      </div>
    </section>
  )
}
