# Sequence Interaction Bible (FROZEN)

Engineering se zyada important. Har interaction ka exact chain.

## Drag Block

```
pointerdown on block body → EventBus: block.dragStart
pointermove → ghost @ 40% opacity, snap flash
pointerup → block.dragEnd → Transaction [MoveBlock] → one undo → markDirty
```

## Draw (brush commit)

```
pointerup → bridge.onCanvasPaintCommit
→ AssetManager.appendDrawingVersion
→ Transaction: CreateOrUpdateHoldBlock
→ timeline block (FT-001 <150ms)
→ graph.markDirty(track)
```

## Double-click Sequence / Compound

```
dblclick → block.openInner → push editPath
→ breadcrumb update → switch innerSequenceId (FT-022 <200ms)
→ playhead reset to 0 on first open
```

## Context Menu

```
contextmenu → scoped menu → command.request → Transaction (never raw store mutation)
```

## Cmd+G Compound

```
multi-select → Cmd+G → GroupCompoundTransaction → toast "Compound created"
```

## Playback

```
Space → playback.toggle → scheduler play/pause
scrub ruler → playback.seek → evaluateAt(timeMs)
```

## Undo

```
Cmd+Z → TransactionDispatcher.undo → one gesture reversed
```
