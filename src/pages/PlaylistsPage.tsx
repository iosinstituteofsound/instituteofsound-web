import { useCallback } from 'react'
import { useContent } from '@/hooks/useContent'
import { getPlaylists } from '@/api/endpoints'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { PlaylistCard } from '@/components/cards/PlaylistCard'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function PlaylistsPage() {
  const { data, loading, error } = useContent(useCallback(() => getPlaylists(), []))

  return (
    <div className="section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Sonic Archives"
          title="Playlists"
          subtitle="Midnight Frequencies. Noise Ritual. Underground Protocol. Collect them all."
        />
        {loading && <LoadingTransmission />}
        {error && <p className="text-crimson">{error}</p>}
        {data && (
          <AnimatedGrid columns={3}>
            {data.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </AnimatedGrid>
        )}
      </div>
    </div>
  )
}
