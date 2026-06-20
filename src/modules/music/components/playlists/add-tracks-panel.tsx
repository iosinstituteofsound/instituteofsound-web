import { PlaylistTrackSearchPanel } from '@/modules/music/components/playlist-track-search-panel'
import type { PlaylistTrackSearchResultDto } from '@/modules/music/types/music.types'
import '@/modules/music/styles/playlist.css'

type AddTracksPanelProps = {
  playlistTrackIds: Set<string>
  onAddTrack: (trackId: string) => void
  isAdding?: boolean
  searchTracks: (q: string, limit?: number) => Promise<PlaylistTrackSearchResultDto>
  searchHint?: string
}

export function AddTracksPanel({
  playlistTrackIds,
  onAddTrack,
  isAdding,
  searchTracks,
  searchHint,
}: AddTracksPanelProps) {
  return (
    <section className="playlist-add-tracks" aria-labelledby="playlist-add-tracks-heading">
      <h2 id="playlist-add-tracks-heading" className="playlist-section-label">
        Add tracks
      </h2>
      <PlaylistTrackSearchPanel
        playlistTrackIds={playlistTrackIds}
        onAddTrack={onAddTrack}
        isAdding={isAdding}
        searchFn={searchTracks}
        searchHint={searchHint}
      />
    </section>
  )
}
