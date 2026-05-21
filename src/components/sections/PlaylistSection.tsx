import { Link } from 'react-router-dom'
import type { Playlist } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { PlaylistCard } from '@/components/cards/PlaylistCard'

interface PlaylistSectionProps {
  playlists: Playlist[]
}

export function PlaylistSection({ playlists }: PlaylistSectionProps) {
  return (
    <section className="section-padding border-t border-border bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          kicker="Listen"
          title="Curated Playlists"
          subtitle="Editorial collections for every mood in the underground."
        />
        <AnimatedGrid columns={3}>
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </AnimatedGrid>
        <div className="mt-12 text-center">
          <Link
            to="/playlists"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-rs-red transition-colors"
          >
            Explore All Playlists →
          </Link>
        </div>
      </div>
    </section>
  )
}
