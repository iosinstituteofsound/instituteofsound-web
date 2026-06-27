import { Outlet } from 'react-router-dom'
import { UniversalPlayer } from '@/modules/player/components/universal-player'
import { MessengerDock } from '@/modules/messenger/components/messenger-dock'
import { MessengerCallOverlay } from '@/modules/messenger/components/messenger-call-overlay'
import { MessengerThreadSubscriptions } from '@/modules/messenger/components/messenger-thread-subscriptions'
import { PlayerBarDock } from '@/modules/player/components/player-bar-dock'
import { PlayerQueuePanel } from '@/modules/player/components/player-queue-panel'
import { PlayerLyricsPanel } from '@/modules/player/components/player-lyrics-panel'
import { AddToPlaylistDialog } from '@/modules/music/components/add-to-playlist-dialog'
import { PlayerStateSync } from '@/modules/player/hooks/use-player-state-sync'
import { DexIntegration } from '@/modules/dex/components/dex-integration'

/** Global shell rendered inside RouterProvider so portaled UI can use router links. */
export function AppRoot() {
  return (
    <>
      <PlayerStateSync />
      <Outlet />
      <UniversalPlayer />
      <MessengerThreadSubscriptions />
      <MessengerDock />
      <MessengerCallOverlay />
      <PlayerBarDock />
      <PlayerQueuePanel />
      <PlayerLyricsPanel />
      <AddToPlaylistDialog />
      <DexIntegration />
    </>
  )
}
