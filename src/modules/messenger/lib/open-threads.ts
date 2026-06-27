import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'

type PopupWindow = {
  threadId: string
  minimized: boolean
  stacked: boolean
}

export function getOpenThreadIds(
  activeThreadId: string | null,
  windows: PopupWindow[],
): string[] {
  const ids = new Set<string>()
  if (activeThreadId) ids.add(activeThreadId)
  for (const window of windows) {
    if (!window.minimized && !window.stacked) {
      ids.add(window.threadId)
    }
  }
  return [...ids]
}

export function isThreadOpen(
  threadId: string,
  activeThreadId: string | null,
  windows: PopupWindow[],
): boolean {
  return getOpenThreadIds(activeThreadId, windows).includes(threadId)
}

export function getOpenThreadIdsFromStores(): string[] {
  const activeThreadId = useMessengerUiStore.getState().activeThreadId
  const windows = useMessengerPopupStore.getState().windows
  return getOpenThreadIds(activeThreadId, windows)
}
