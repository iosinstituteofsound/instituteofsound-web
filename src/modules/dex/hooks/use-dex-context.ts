import { useMemo, useSyncExternalStore } from 'react'
import { router } from '@/app/router/routes'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import type { DexContext } from '@instituteofsound/dex'

function subscribeToRouter(onChange: () => void) {
  return router.subscribe(onChange)
}

function getRouterPathname() {
  return router.state.location.pathname
}

function parseDexContext(
  pathname: string,
  currentTrack: ReturnType<typeof usePlayerStore.getState>['currentTrack'],
): DexContext {
  const trackMatch = pathname.match(/\/tracks\/([^/]+)/)
  const releaseMatch = pathname.match(/\/releases\/([^/]+)/)
  const profileMatch = pathname.match(/\/profile\/([^/]+)/)

  return {
    trackId: trackMatch?.[1] ?? currentTrack?.trackId,
    releaseId: releaseMatch?.[1] ?? currentTrack?.releaseId,
    userId: profileMatch?.[1],
    artistProfileId: currentTrack?.artistProfileId,
  }
}

export function useDexContext(): DexContext {
  const pathname = useSyncExternalStore(subscribeToRouter, getRouterPathname, getRouterPathname)
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  return useMemo(() => parseDexContext(pathname, currentTrack), [pathname, currentTrack])
}
