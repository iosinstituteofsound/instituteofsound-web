import { useCallback } from 'react'
import { useContent } from '@/hooks/useContent'
import { listDiscoverArtists } from '@/lib/artist-profile/service'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { WaveformBackground } from '@/components/effects/WaveformBackground'

export default function DiscoverPage() {
  const { data, loading, error } = useContent(
    useCallback(() => listDiscoverArtists(), [])
  )

  return (
    <div className="relative">
      <div className="relative min-h-[50vh] flex items-end section-padding pb-0 overflow-hidden">
        <WaveformBackground />
        <SectionHeading
          label="Archive Access"
          title="Discover"
          subtitle="Emerging artists, underground bands, experimental creators."
        />
      </div>
      <div className="section-padding pt-12">
        <div className="max-w-7xl mx-auto">
          {loading && <LoadingTransmission variant="compact" />}
          {error && <p className="text-crimson">{error}</p>}
          {data && data.length === 0 && (
            <p className="text-muted text-sm max-w-lg">
              Abhi koi live artist profile nahi. Dashboard se profile complete karo — naam, bio,
              avatar, aur kam se kam ek track ya video — phir yahan automatically dikhega.
            </p>
          )}
          {data && data.length > 0 && (
            <AnimatedGrid columns={3}>
              {data.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </AnimatedGrid>
          )}
        </div>
      </div>
    </div>
  )
}
