import { Link } from 'react-router-dom'
import type { Artist } from '@/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { ArtistCard } from '@/components/cards/ArtistCard'

interface FeaturedArtistsSectionProps {
  artists: Artist[]
  limit?: number
}

export function FeaturedArtistsSection({
  artists,
  limit = 6,
}: FeaturedArtistsSectionProps) {
  const featured = artists.filter((a) => a.featured).slice(0, limit)
  const display = featured.length > 0 ? featured : artists.slice(0, limit)

  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Transmission 002"
          title="Featured Artists"
          subtitle="Emerging voices from the underground. Experimental. Cinematic. Unclassified."
        />
        <AnimatedGrid columns={3}>
          {display.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </AnimatedGrid>
        <div className="mt-12 text-center">
          <Link
            to="/discover"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-neon transition-colors"
          >
            View All Artists →
          </Link>
        </div>
      </div>
    </section>
  )
}
