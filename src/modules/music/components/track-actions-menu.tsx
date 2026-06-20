import { ListMusic, ListPlus, MoreHorizontal, PlayCircle } from 'lucide-react'
import { playerTrackFromCurrent } from '@/modules/music/lib/player-queue'
import { resolvePlaylistTrackId } from '@/modules/music/lib/resolve-track-id'
import { usePlaylistPickerStore } from '@/modules/music/stores/playlist-picker-store'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

type TrackActionsMenuProps = {
  trackId?: string
  id?: string
  title: string
  artist?: string
  audioUrl?: string
  streamUrl?: string
  artworkUrl?: string
  durationSec?: number
  releaseId?: string
  artistProfileId?: string
  triggerClassName?: string
  variant?: 'icon' | 'button'
}

export function TrackActionsMenu({
  trackId,
  id,
  title,
  artist,
  audioUrl,
  streamUrl,
  artworkUrl,
  durationSec,
  releaseId,
  artistProfileId,
  triggerClassName,
  variant = 'icon',
}: TrackActionsMenuProps) {
  const addToQueue = usePlayerStore((s) => s.addToQueue)
  const addToQueueNext = usePlayerStore((s) => s.addToQueueNext)
  const openPicker = usePlaylistPickerStore((s) => s.open)

  const playerTrack = playerTrackFromCurrent({
    trackId,
    title,
    artist,
    audioUrl,
    streamUrl,
    artworkUrl,
    durationSec,
    releaseId,
    artistProfileId,
  })

  const resolvedTrackId = resolvePlaylistTrackId(trackId, id)
  const canQueue = Boolean(playerTrack)
  const canPlaylist = Boolean(resolvedTrackId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'button' ? (
          <Button size="sm" variant="ghost" className={triggerClassName}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Track actions</span>
          </Button>
        ) : (
          <button type="button" className={triggerClassName} aria-label="Track actions">
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!canQueue}
          onClick={() => playerTrack && addToQueueNext(playerTrack)}
        >
          <PlayCircle className="size-4" />
          Play next
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canQueue} onClick={() => playerTrack && addToQueue(playerTrack)}>
          <ListPlus className="size-4" />
          Add to queue
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canPlaylist}
          onClick={() =>
            resolvedTrackId &&
            openPicker({
              trackId: resolvedTrackId,
              title,
              artist,
              artworkUrl,
            })
          }
        >
          <ListMusic className="size-4" />
          Add to playlist
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
