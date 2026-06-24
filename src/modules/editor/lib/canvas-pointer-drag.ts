export function trackPointerDrag(options: {
  onMove: (clientX: number, clientY: number) => void
  onEnd: () => void
}) {
  const onMove = (event: PointerEvent) => {
    options.onMove(event.clientX, event.clientY)
  }
  const onEnd = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onEnd)
    document.removeEventListener('pointercancel', onEnd)
    options.onEnd()
  }

  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onEnd)
  document.addEventListener('pointercancel', onEnd)
}

export function beginPointerDrag(
  event: { stopPropagation: () => void; preventDefault: () => void; clientX: number; clientY: number },
  onStart: () => void,
  onMove: (clientX: number, clientY: number) => void,
  onEnd: () => void,
) {
  event.stopPropagation()
  event.preventDefault()
  onStart()
  trackPointerDrag({ onMove, onEnd })
}
