import { Loader2, X } from 'lucide-react'
import { ShuffleQueueList } from '@/modules/player/components/shuffle-queue-list'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import '@/modules/player/styles/player-queue-shuffle.css'

export function PlayerQueuePanel() {
  const isOpen = usePlayerStore((s) => s.isQueueOpen)
  const closeQueue = usePlayerStore((s) => s.closeQueue)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const queueSource = usePlayerStore((s) => s.queueSource)
  const isShuffling = usePlayerStore((s) => s.isShuffling)
  const shuffleAnimationKey = usePlayerStore((s) => s.shuffleAnimationKey)
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex)
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)
  const openPlaylistModal = usePlayerStore((s) => s.openPlaylistModal)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeQueue()}>
      <DialogContent className="max-w-md gap-0 p-4 sm:p-5">
        <DialogHeader className="space-y-0">
          <div className="player-queue-panel__header">
            <div className="player-queue-panel__source">
              {queueSource?.kind === 'playlist' || queueSource?.kind === 'release' ? (
                <button
                  type="button"
                  className="player-queue-panel__source-btn"
                  onClick={openPlaylistModal}
                >
                  <p className="player-queue-panel__source-label">
                    {queueSource.kind === 'playlist' ? 'Playlist' : 'Release'}
                  </p>
                  <p className="player-queue-panel__source-title">{queueSource.title}</p>
                </button>
              ) : (
                <>
                  <p className="player-queue-panel__source-label">Queue</p>
                  <p className="player-queue-panel__source-title">Up next</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isShuffling ? (
                <span className="player-queue-panel__shuffling-badge">
                  <Loader2 className="size-3 animate-spin" />
                  Shuffling
                </span>
              ) : (
                <span className="player-queue-panel__count">{queue.length} tracks</span>
              )}
              <button
                type="button"
                className="player-queue-panel__remove"
                aria-label="Close queue"
                onClick={closeQueue}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <DialogTitle className="sr-only">Playback queue</DialogTitle>
        </DialogHeader>

        <div className="player-queue-panel">
          <ShuffleQueueList
            queueIndex={queueIndex}
            onPlayIndex={playQueueIndex}
            onRemoveIndex={removeFromQueue}
            shuffleAnimationKey={shuffleAnimationKey}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
