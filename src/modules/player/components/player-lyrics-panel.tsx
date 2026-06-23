import { Mic2, X } from 'lucide-react'
import { PlayerLyricsContent } from '@/modules/player/components/player-lyrics-content'
import { useTrackLyrics } from '@/modules/player/hooks/use-track-lyrics'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/player-lyrics-panel.css'

export function PlayerLyricsPanel() {
  const isOpen = usePlayerStore((s) => s.isLyricsOpen)
  const mobileView = usePlayerStore((s) => s.mobileView)
  const closeLyrics = usePlayerStore((s) => s.closeLyrics)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const { hasSyncedPlayback } = useTrackLyrics(currentTrack)

  if (!currentTrack) return null

  const showDrawer = isOpen && mobileView !== 'sheet'

  return (
    <Dialog open={showDrawer} onOpenChange={(open) => !open && closeLyrics()}>
      <DialogContent
        hideCloseButton
        className={cn(
          'player-lyrics-drawer',
          'fixed inset-y-0 right-0 left-auto top-0 z-[110] flex h-full w-[min(24rem,92vw)] max-w-none',
          'translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l p-0 shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'duration-300',
        )}
      >
        <header className="player-lyrics-drawer__header">
          <div className="min-w-0 flex-1">
            <p className="player-lyrics-drawer__kicker">
              <Mic2 className="mr-1 inline size-3" aria-hidden />
              Lyrics
            </p>
            <DialogTitle className="player-lyrics-drawer__title">{currentTrack.title}</DialogTitle>
            {currentTrack.artist ? (
              <p className="player-lyrics-drawer__artist">{currentTrack.artist}</p>
            ) : null}
            <DialogDescription className="sr-only">
              {hasSyncedPlayback ? 'Synced lyrics for the current track' : 'Lyrics for the current track'}
            </DialogDescription>
          </div>
          <button
            type="button"
            className="player-lyrics-drawer__close"
            onClick={closeLyrics}
            aria-label="Close lyrics"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <PlayerLyricsContent className="flex-1" />
      </DialogContent>
    </Dialog>
  )
}
