import type { Data } from '@measured/puck'
import { useCallback, useRef, useState } from 'react'
import { clonePuckData, puckDataEqual } from '@/modules/editor/lib/clone-puck-data'

const MAX_HISTORY = 50
const HISTORY_DEBOUNCE_MS = 350

export type CanvasPreviewMode = 'current' | 'original' | 'compare'

interface UseArticleCanvasHistoryOptions {
  onApply: (data: Data) => void
}

export function useArticleCanvasHistory({ onApply }: UseArticleCanvasHistoryOptions) {
  const pastRef = useRef<Data[]>([])
  const futureRef = useRef<Data[]>([])
  const baselineRef = useRef<Data | null>(null)
  const pendingPastRef = useRef<Data | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHistoryActionRef = useRef(false)
  const [revision, setRevision] = useState(0)
  const [previewMode, setPreviewMode] = useState<CanvasPreviewMode>('current')

  const bump = useCallback(() => setRevision((value) => value + 1), [])

  const flushPending = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    const pending = pendingPastRef.current
    if (!pending) return
    pendingPastRef.current = null
    const last = pastRef.current[pastRef.current.length - 1]
    if (last && puckDataEqual(last, pending)) return
    pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), pending]
    futureRef.current = []
    bump()
  }, [bump])

  const setBaseline = useCallback(
    (data: Data) => {
      const next = clonePuckData(data)
      if (baselineRef.current && puckDataEqual(baselineRef.current, next)) {
        return
      }
      baselineRef.current = next
      pastRef.current = []
      futureRef.current = []
      pendingPastRef.current = null
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      setPreviewMode((mode) => (mode === 'current' ? mode : 'current'))
      bump()
    },
    [bump],
  )

  const recordChange = useCallback(
    (previous: Data) => {
      if (isHistoryActionRef.current) return
      if (!pendingPastRef.current) {
        pendingPastRef.current = clonePuckData(previous)
      }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        flushPending()
      }, HISTORY_DEBOUNCE_MS)
    },
    [flushPending],
  )

  const applyHistoryState = useCallback(
    (data: Data) => {
      isHistoryActionRef.current = true
      onApply(data)
      queueMicrotask(() => {
        isHistoryActionRef.current = false
      })
    },
    [onApply],
  )

  const undo = useCallback(
    (present: Data) => {
      flushPending()
      const past = pastRef.current
      if (!past.length) return
      const previous = past[past.length - 1]
      pastRef.current = past.slice(0, -1)
      futureRef.current = [clonePuckData(present), ...futureRef.current]
      applyHistoryState(previous)
      setPreviewMode('current')
      bump()
    },
    [applyHistoryState, bump, flushPending],
  )

  const redo = useCallback(
    (present: Data) => {
      flushPending()
      const future = futureRef.current
      if (!future.length) return
      const [next, ...rest] = future
      futureRef.current = rest
      pastRef.current = [...pastRef.current, clonePuckData(present)]
      applyHistoryState(next)
      setPreviewMode('current')
      bump()
    },
    [applyHistoryState, bump, flushPending],
  )

  const redoAll = useCallback(
    (present: Data) => {
      flushPending()
      const future = futureRef.current
      if (!future.length) return
      let current = clonePuckData(present)
      const newPast = [...pastRef.current]
      while (futureRef.current.length) {
        newPast.push(current)
        current = futureRef.current.shift()!
      }
      pastRef.current = newPast
      applyHistoryState(current)
      setPreviewMode('current')
      bump()
    },
    [applyHistoryState, bump, flushPending],
  )

  const revert = useCallback(() => {
    flushPending()
    const baseline = baselineRef.current
    if (!baseline) return
    pastRef.current = []
    futureRef.current = []
    applyHistoryState(clonePuckData(baseline))
    setPreviewMode('current')
    bump()
  }, [applyHistoryState, bump, flushPending])

  const canUndo = pastRef.current.length > 0 || Boolean(pendingPastRef.current)
  const canRedo = futureRef.current.length > 0
  const canRedoAll = futureRef.current.length > 1
  const hasBaseline = Boolean(baselineRef.current)

  return {
    revision,
    previewMode,
    setPreviewMode,
    baselineData: baselineRef.current,
    setBaseline,
    recordChange,
    undo,
    redo,
    redoAll,
    revert,
    canUndo,
    canRedo,
    canRedoAll,
    hasBaseline,
    flushPending,
  }
}
