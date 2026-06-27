import { useCallback, useRef, useState, type RefObject } from 'react'

const DEFAULT_CLOSE_DELAY_MS = 280

export function useReactionHoverPicker(options?: { closeDelayMs?: number; unlockSounds?: () => void }) {
  const closeDelayMs = options?.closeDelayMs ?? DEFAULT_CLOSE_DELAY_MS
  const [pickerOpen, setPickerOpen] = useState(false)
  const likeButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const openPicker = useCallback(() => {
    clearCloseTimer()
    options?.unlockSounds?.()
    setPickerOpen(true)
  }, [clearCloseTimer, options])

  const scheduleClosePicker = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setPickerOpen(false), closeDelayMs)
  }, [clearCloseTimer, closeDelayMs])

  const closePicker = useCallback(() => {
    clearCloseTimer()
    setPickerOpen(false)
  }, [clearCloseTimer])

  return {
    pickerOpen,
    setPickerOpen,
    likeButtonRef,
    containerRef,
    openPicker,
    scheduleClosePicker,
    closePicker,
  }
}

export type ReactionHoverPickerRefs = {
  likeButtonRef: RefObject<HTMLButtonElement | null>
  containerRef: RefObject<HTMLDivElement | null>
}
