import { useSequenceEngine } from '@/modules/illustrator/context/sequence-engine-context'
import { useCallback, useSyncExternalStore } from 'react'

type SequenceBreadcrumbProps = {
  onNavigate?: (sequenceId: string) => void
}

export function SequenceBreadcrumb({ onNavigate }: SequenceBreadcrumbProps) {
  const { store, bridge } = useSequenceEngine()
  const subscribe = useCallback((onChange: () => void) => store.subscribe(onChange), [store])
  const getState = useCallback(() => store.getState(), [store])
  useSyncExternalStore(subscribe, getState, getState)

  const path = bridge.getEditPath()
  if (path.length <= 1) return null

  return (
    <nav className="mas-sequence-breadcrumb" data-testid="sequence-breadcrumb" aria-label="Sequence edit path">
      {path.map((node, index) => {
        const isLast = index === path.length - 1
        return (
          <span key={`${node.sequenceId}-${index}`} className="mas-sequence-breadcrumb__segment">
            {index > 0 ? <span className="mas-sequence-breadcrumb__sep">›</span> : null}
            {isLast ? (
              <span className="mas-sequence-breadcrumb__current">{node.label}</span>
            ) : (
              <button
                type="button"
                className="mas-sequence-breadcrumb__link"
                onClick={() => {
                  while (bridge.getEditPath().length > index + 1) {
                    bridge.closeInnerEdit()
                  }
                  onNavigate?.(node.sequenceId)
                }}
              >
                {node.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
