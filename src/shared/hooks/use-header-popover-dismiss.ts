import { useEffect, type RefObject } from 'react'

type HeaderPopoverDismissOptions = {
  onEscape?: () => void
}

export function useHeaderPopoverDismiss(
  open: boolean,
  onClose: () => void,
  rootRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  options?: HeaderPopoverDismissOptions,
) {
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      onClose()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (options?.onEscape) {
        options.onEscape()
        return
      }
      onClose()
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open, options, panelRef, rootRef])
}
