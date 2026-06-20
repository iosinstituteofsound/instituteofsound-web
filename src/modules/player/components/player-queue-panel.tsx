import { Link } from 'react-router-dom'
import { Loader2, Shuffle, X } from 'lucide-react'
import { PlayerQueueList } from '@/modules/player/components/player-queue-list'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/player-queue-shuffle.css'

function queueSourceLabel(kind: string | undefined) {
  if (kind === 'playlist') return 'Playlist'
  if (kind === 'release') return 'Release'
  return 'Queue'
}

function queueFullPageHref(
  queueSource: ReturnType<typeof usePlayerStore.getState>['queueSource'],
): string | null {
  if (!queueSource) return null
  if (queueSource.kind === 'playlist') {
    return queueSource.isOwn
      ? `/library/playlists/${queueSource.slug}`
      : `/playlists/${queueSource.slug}`
  }
  if (queueSource.kind === 'release') {
    return `/releases/${queueSource.slug ?? queueSource.id}`
  }
  return null
}

export function PlayerQueuePanel() {
  const isOpen = usePlayerStore((s) => s.isQueueOpen)
  const closeQueue = usePlayerStore((s) => s.closeQueue)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const queueSource = usePlayerStore((s) => s.queueSource)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const isShuffling = usePlayerStore((s) => s.isShuffling)
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex)
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)
  const reorderQueue = usePlayerStore((s) => s.reorderQueue)
  const shuffleQueueAnimated = usePlayerStore((s) => s.shuffleQueueAnimated)

  const title = queueSource?.title ?? 'Up next'
  const fullPageHref = queueFullPageHref(queueSource)

  const handleShuffle = () => {
    if (queue.length <= 1 || isShuffling) return
    void shuffleQueueAnimated()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeQueue()}>
      <DialogContent
        hideCloseButton
        className={cn(
          'player-queue-drawer',
          'fixed inset-y-0 right-0 left-auto top-0 z-[110] flex h-full w-[min(22rem,92vw)] max-w-none',
          'translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l p-0 shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'duration-300',
        )}
      >
        <header className="player-queue-drawer__header">
          <div className="min-w-0 flex-1">
            <p className="player-queue-panel__source-label">
              {queueSourceLabel(queueSource?.kind)}
            </p>
            <DialogTitle className="player-queue-drawer__title">{title}</DialogTitle>
            <DialogDescription className="sr-only">Playback queue</DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isShuffling ? (
              <span className="player-queue-panel__shuffling-badge">
                <Loader2 className="size-3 animate-spin" />
                Shuffling
              </span>
            ) : (
              <span className="player-queue-panel__count">
                {queue.length} track{queue.length === 1 ? '' : 's'}
              </span>
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
        </header>

        <div className="player-queue-drawer__toolbar">
          <Button
            type="button"
            size="sm"
            variant={shuffle ? 'default' : 'outline'}
            className="gap-1.5"
            onClick={handleShuffle}
            disabled={queue.length <= 1 || isShuffling}
          >
            <Shuffle className="size-4" aria-hidden />
            Shuffle queue
          </Button>
        </div>

        <div className="player-queue-drawer__body">
          <PlayerQueueList
            queueIndex={queueIndex}
            onPlayIndex={playQueueIndex}
            onRemoveIndex={removeFromQueue}
            onReorder={reorderQueue}
          />
        </div>

        {fullPageHref ? (
          <footer className="player-queue-drawer__footer">
            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <Link to={fullPageHref} onClick={closeQueue}>
                Open full page
              </Link>
            </Button>
          </footer>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
