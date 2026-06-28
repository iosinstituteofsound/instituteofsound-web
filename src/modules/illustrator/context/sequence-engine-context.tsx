import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { SequenceStore, createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'
import { createStudioBridge, type BridgeCallbacks, type StudioBridge } from '@/modules/illustrator/lib/sequence/studio-bridge'
import type { PersistedSequenceBundle } from '@/modules/illustrator/lib/sequence/sequence-persistence'
import { timelineEventBus, type TimelineEventBus } from '@/modules/illustrator/lib/timeline/event-bus'

export type SequenceEngineContextValue = {
  store: SequenceStore
  assetManager: AssetManager
  bridge: StudioBridge
  eventBus: TimelineEventBus
  bumpRevision: () => void
  revision: number
  preferSequenceUndo: () => void
  clearSequenceUndoPreference: () => void
  shouldPreferSequenceUndo: () => boolean
}

const SequenceEngineContext = createContext<SequenceEngineContextValue | null>(null)

export type SequenceEngineProviderProps = {
  children: ReactNode
  initialBundle?: PersistedSequenceBundle | null
  bridgeCallbacks?: BridgeCallbacks
}

export function SequenceEngineProvider({
  children,
  initialBundle,
  bridgeCallbacks,
}: SequenceEngineProviderProps) {
  const [revision, setRevision] = useState(0)
  const bumpRevision = useRef(() => setRevision((v) => v + 1)).current
  const preferSequenceUndoRef = useRef(false)

  const engine = useMemo(() => {
    const store = new SequenceStore(initialBundle?.state ?? createInitialSequenceState())
    const assetManager = new AssetManager()
    if (initialBundle?.drawingPayloads) {
      assetManager.importDrawingPayloads(initialBundle.drawingPayloads)
    }
    const callbacks: BridgeCallbacks = {
      ...bridgeCallbacks,
      onTimelineMutation: () => {
        preferSequenceUndoRef.current = true
        bridgeCallbacks?.onTimelineMutation?.()
      },
    }
    const bridge = createStudioBridge(store, assetManager, bumpRevision, callbacks)
    return { store, assetManager, bridge, eventBus: timelineEventBus }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engine instance is created once per mount
  }, [])

  const ctx = useMemo(
    (): SequenceEngineContextValue => ({
      ...engine,
      revision,
      bumpRevision,
      preferSequenceUndo: () => {
        preferSequenceUndoRef.current = true
      },
      clearSequenceUndoPreference: () => {
        preferSequenceUndoRef.current = false
      },
      shouldPreferSequenceUndo: () => preferSequenceUndoRef.current,
    }),
    [engine, revision, bumpRevision],
  )

  return <SequenceEngineContext.Provider value={ctx}>{children}</SequenceEngineContext.Provider>
}

export function useSequenceEngine(): SequenceEngineContextValue {
  const ctx = useContext(SequenceEngineContext)
  if (!ctx) throw new Error('useSequenceEngine must be used within SequenceEngineProvider')
  return ctx
}

import { isSequenceEngineEnabled } from '@/modules/illustrator/lib/sequence/feature-flag'

export { isSequenceEngineEnabled }
