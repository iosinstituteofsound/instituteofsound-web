# Sequence UX Contract (FROZEN)

> Har block type ka behavior **ek hi rule** — context, screen size, ya engineer preference se change nahi hoga. Violation = bug.

## Global Principles

| ID | Rule | Never |
|----|------|-------|
| G-1 | Blocks are primary on timeline | Frame strip as primary surface |
| G-2 | One gesture = one Transaction = one Undo | Multi-step undo for single drag |
| G-3 | Silent mutation forbidden | Convert/delete without feedback |
| G-4 | Same block type = same interaction everywhere | Per-track custom drag rules |
| G-5 | Playback pauses on canvas edit | Paint while playing |
| G-6 | Double-click opens; single-click selects | Double-click to rename inline |

## HoldBlock

- **Create:** First paint on empty track @ playhead → CreateHoldBlockTransaction + toast
- **Stretch:** Right edge only → durationMs changes, **same assetRefId**
- **Move:** Body drag → startTimeMs only
- **Visual:** Solid bar with label/thumbnail

## SequenceBlock

- **Open:** Double-click → breadcrumb + inner sequence focus
- **Close:** Breadcrumb or Esc
- **Convert:** Explicit context menu only
- **Visual:** Sequence badge at default zoom

## CompoundBlock

- **Create:** Cmd+G on multi-select
- **Open:** Double-click innerSequenceId
- **Data:** Parent stores only innerSequenceId + time span

## ReferenceBlock

- **Visual:** Dashed border / link icon
- **Update:** Master edit updates all instances on next eval

## Conversion (Identity)

- C-1: All conversions explicit
- C-2: assetRefId preserved round-trip
- C-3: Toast states outcome
- C-4: Expand is inverse of Convert
