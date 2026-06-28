import { useMemo, useSyncExternalStore, useCallback } from 'react'
import type {
  AnimationBlock,
  BlockBehavior,
  BlockModifier,
  HoldBlock,
  ReferenceBlock,
} from '@/modules/illustrator/lib/sequence/sequence.types'
import { countMasterInstances } from '@/modules/illustrator/lib/sequence/commands/reference-commands'
import { useSequenceEngine } from '@/modules/illustrator/context/sequence-engine-context'
import { isSequenceEngineEnabled } from '@/modules/illustrator/lib/sequence/feature-flag'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

const BEHAVIORS: BlockBehavior['kind'][] = ['loop', 'ping-pong', 'one-shot', 'clamp', 'bounce']

export function SequenceBlockInspector() {
  const { store, bridge } = useSequenceEngine()
  const subscribe = useCallback((onChange: () => void) => store.subscribe(onChange), [store])
  const getState = useCallback(() => store.getState(), [store])
  const state = useSyncExternalStore(subscribe, getState, getState)

  const block = useMemo((): AnimationBlock | null => {
    if (state.selection.kind !== 'blocks' || !state.selection.ids.length) return null
    const seq = state.sequences[state.activeSequenceId]
    const id = state.selection.ids[0]
    return seq?.blocks.find((b) => b.id === id) ?? null
  }, [state])

  if (!isSequenceEngineEnabled()) return null

  const settings = state.settings

  if (!block) {
    return (
      <div className="mas-sequence-inspector" data-testid="sequence-block-inspector">
        <p className="mas-sequence-inspector__heading">Timeline</p>
        <section className="mas-sequence-inspector__section" data-testid="sequence-inspector-settings">
          <label className="mas-sequence-inspector__field mas-sequence-inspector__field--toggle">
            <span>Ripple delete</span>
            <input
              type="checkbox"
              checked={settings.rippleDelete}
              onChange={(e) => bridge.updateSettings({ rippleDelete: e.target.checked })}
              data-testid="sequence-ripple-toggle"
            />
          </label>
          <label className="mas-sequence-inspector__field mas-sequence-inspector__field--toggle">
            <span>Snap</span>
            <input
              type="checkbox"
              checked={settings.snapEnabled}
              onChange={(e) => bridge.updateSettings({ snapEnabled: e.target.checked })}
            />
          </label>
        </section>
        <p className="mas-sequence-inspector__hint">Select a clip to edit behavior and modifiers.</p>
      </div>
    )
  }

  const isHold = block.type === 'hold'
  const isSequence = block.type === 'sequence'
  const isCompound = block.type === 'compound'
  const isReference = block.type === 'reference'
  const isNested = isSequence || isCompound
  const holdBlock = isHold ? (block as HoldBlock) : null
  const refBlock = isReference ? (block as ReferenceBlock) : null
  const innerFrameCount = isNested
    ? state.sequences[block.innerSequenceId]?.blocks.filter((b) => b.type === 'hold').length
    : 0
  const instanceCount = refBlock ? countMasterInstances(state, refBlock.masterAssetRefId) : 0

  const speedMod = holdBlock?.modifiers.find((m) => m.type === 'speed')
  const speedRate = speedMod?.type === 'speed' ? speedMod.rate : 1

  const setBehavior = (kind: BlockBehavior['kind']) => {
    bridge.updateBlockBehavior(block.id, { kind })
  }

  const setSpeed = (rate: number) => {
    if (!holdBlock) return
    const others = holdBlock.modifiers.filter((m) => m.type !== 'speed')
    const modifiers: BlockModifier[] = rate === 1 ? others : [...others, { type: 'speed', rate }]
    bridge.updateBlockModifiers(block.id, modifiers)
  }

  const convertToSequence = () => {
    if (block.type !== 'hold') {
      toast.error('Sirf hold clip convert ho sakta hai')
      return
    }
    const count = bridge.convertHoldToSequence(block.id)
    if (count) toast.success(`Converted to Sequence (${count} frames)`)
    else toast.error('Convert fail — clip refresh karke try karo')
  }

  const convertToReference = () => {
    if (bridge.convertHoldToReference(block.id)) {
      toast.success('Converted to Reference')
    } else {
      toast.error('Reference convert fail')
    }
  }

  const expandToFrames = () => {
    const count = bridge.expandSequenceToFrames(block.id)
    if (count) toast.success(`Expanded to ${count} frames`)
  }

  const openInner = () => {
    if (bridge.openInnerBlock(block.id)) {
      toast.success(`Editing ${state.sequences[isNested ? block.innerSequenceId : '']?.name ?? block.label}`)
    }
  }

  const ungroupCompound = () => {
    if (bridge.ungroupCompound(block.id)) {
      toast.success('Compound ungrouped')
    }
  }

  const duplicateReference = () => {
    if (bridge.duplicateReferenceInstance(block.id)) {
      toast.success('Reference instance duplicated')
    }
  }

  const heading = isReference
    ? 'Reference clip'
    : isCompound
      ? 'Compound clip'
      : isSequence
        ? 'Sequence clip'
        : 'Block'

  return (
    <div className="mas-sequence-inspector" data-testid="sequence-block-inspector">
      <p className="mas-sequence-inspector__heading">{heading}</p>
      <p className="mas-sequence-inspector__label truncate">{block.label}</p>

      <section className="mas-sequence-inspector__section" data-testid="sequence-inspector-conversion">
        <h4 className="mas-sequence-inspector__section-title">Conversion</h4>
        <div className="mas-sequence-inspector__actions">
          {isHold ? (
            <>
              <button
                type="button"
                className="mas-sequence-inspector__action"
                data-testid="sequence-convert-btn"
                onClick={convertToSequence}
              >
                Convert to Sequence
              </button>
              <button
                type="button"
                className="mas-sequence-inspector__action"
                data-testid="sequence-reference-btn"
                onClick={convertToReference}
              >
                Convert to Reference
              </button>
            </>
          ) : null}
          {isNested ? (
            <>
              <button type="button" className="mas-sequence-inspector__action" onClick={openInner}>
                Open inner edit
              </button>
              {isSequence ? (
                <button
                  type="button"
                  className="mas-sequence-inspector__action"
                  data-testid="sequence-expand-btn"
                  onClick={expandToFrames}
                >
                  Expand to Frames
                </button>
              ) : null}
              {isCompound ? (
                <button
                  type="button"
                  className="mas-sequence-inspector__action"
                  data-testid="sequence-ungroup-btn"
                  onClick={ungroupCompound}
                >
                  Ungroup
                </button>
              ) : null}
              <p className="mas-sequence-inspector__meta">{innerFrameCount} inner frames</p>
            </>
          ) : null}
          {isReference ? (
            <>
              <button
                type="button"
                className="mas-sequence-inspector__action"
                data-testid="sequence-dup-ref-btn"
                onClick={duplicateReference}
              >
                Duplicate Instance
              </button>
              <p className="mas-sequence-inspector__meta">{instanceCount} instance(s) of master</p>
            </>
          ) : null}
        </div>
      </section>

      <section className="mas-sequence-inspector__section" data-testid="sequence-inspector-behavior">
        <h4 className="mas-sequence-inspector__section-title">Behavior</h4>
        <div className="mas-sequence-inspector__chips">
          {BEHAVIORS.map((kind) => (
            <button
              key={kind}
              type="button"
              className={cn(
                'mas-sequence-inspector__chip',
                block.behavior.kind === kind && 'mas-sequence-inspector__chip--active',
              )}
              onClick={() => setBehavior(kind)}
            >
              {kind}
            </button>
          ))}
        </div>
      </section>

      {isHold ? (
        <section className="mas-sequence-inspector__section" data-testid="sequence-inspector-modifiers">
          <h4 className="mas-sequence-inspector__section-title">Modifiers</h4>
          <label className="mas-sequence-inspector__field">
            <span>Speed</span>
            <input
              type="range"
              min={0.25}
              max={2}
              step={0.25}
              value={speedRate}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="mas-sequence-inspector__value">{speedRate}x</span>
          </label>
        </section>
      ) : null}
    </div>
  )
}
