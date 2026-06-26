import { useCallback, useRef, useState } from 'react'

export function usePanelResize(initial: number, min: number, max: number) {
  const [size, setSize] = useState(initial)
  const dragRef = useRef<{ origin: number; size: number } | null>(null)

  const begin = useCallback(
    (origin: number) => {
      dragRef.current = { origin, size }
    },
    [size],
  )

  const move = useCallback(
    (origin: number, direction: 1 | -1) => {
      if (!dragRef.current) return
      const delta = (origin - dragRef.current.origin) * direction
      setSize(Math.min(max, Math.max(min, dragRef.current.size + delta)))
    },
    [min, max],
  )

  const end = useCallback(() => {
    dragRef.current = null
  }, [])

  return { size, setSize, begin, move, end }
}
