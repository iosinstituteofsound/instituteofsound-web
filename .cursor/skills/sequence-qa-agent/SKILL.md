---
name: sequence-qa-agent
description: >-
  Autonomous QA agent for Infinite Sequence Animation (illustrator studio
  sequence engine). Runs bounded test-fix loops across unit smoke, bridge
  integration, TypeScript, and optional Playwright e2e. Use when the user asks
  to test the sequence tool, find bugs, run QA, or says "sequence qa agent".
---

# Sequence QA Agent

Self-testing agent for everything under `src/modules/illustrator/lib/sequence/` and its studio wiring.

## When to run

- User says: "test sequence", "bug fix karo", "qa agent", "sequence qa", or after any Phase 1–4 implementation.
- Before marking a phase complete.
- After HMR-heavy studio changes (user should hard-refresh; agent still runs headless tests).

## Bounded loop (max 5 iterations)

Stop when **all gates pass** or iteration budget hits 5 — then report blockers.

```
iteration:
  1. npm run test:sequence-qa     → unit + bridge + tsc
  2. (optional) SEQUENCE_E2E=1 npm run test:e2e -- e2e/sequence-feel.spec.ts
  3. If failure → diagnose root cause → minimal fix → goto 1
  4. If pass → report summary
```

**Do not** widen scope into unrelated refactors. One gesture = one fix.

## Test gates (in order)

| Gate | Command | Pass criteria |
|------|---------|---------------|
| G1 Unit + bridge | `npm run test:sequence-qa` | exit 0, all FT-* in `__tests__/` |
| G2 Types | included in G1 (`tsc -b`) | no TS errors |
| G3 E2e smoke | `SEQUENCE_E2E=1 npm run test:e2e:sequence` | only when auth + dev stack available |
| G4 Canvas tools e2e | `SEQUENCE_E2E=1 npm run test:e2e:canvas` | CT-E2E-001..016 all 14 tools |

## Architecture invariants (do not break)

- Time: `evaluate(timeMs)` not frame index
- Sole canvas touchpoint: `studio-bridge.ts`
- Feature flag: `VITE_SEQUENCE_ENGINE=true`
- 1 timeline gesture = 1 undo transaction

## Common failure patterns

| Symptom | Likely cause | Fix location |
|---------|--------------|----------------|
| Paint does nothing | Track sync race / no `ensureTrackForLayer` | `studio-bridge.ts` |
| Convert fails silently | Orphan `trackId` on hold | `conversion-commands.ts` |
| Eval empty / `layers is not iterable` | Double-wrapped composite in eval node | `sequence-eval-node.ts` |
| Cmd+G no-op | `<2` blocks selected or bridge not wired | `illustrator-studio-shell.tsx`, bindings |
| Reference clip blank | Master not registered before command | `studio-bridge.convertHoldToReference` |
| HMR breaks engine | Flag read from hot module | `feature-flag.ts` |

## Fix rules

1. Reproduce with the failing test name (FT-xxx) or add a regression test first.
2. Minimal diff; match existing command/bridge patterns.
3. Re-run `npm run test:sequence-qa` after every fix.
4. Never commit unless user asks.

## Report format

```markdown
## Sequence QA — iteration N

**Gates:** G1 ✅ | G2 ✅ | G3 skipped

**Fixed:**
- [FT-xxx] one-line root cause + file

**Remaining blockers:** (if any)

**Manual verify:** Cmd+Shift+R → paint → convert → Cmd+G → reference
```

## Key paths

```
instituteofsound-web/
├── .env                          # VITE_SEQUENCE_ENGINE=true
├── e2e/sequence-feel.spec.ts
├── e2e/studio-canvas-tools.spec.ts
├── e2e/helpers/studio.ts
├── package.json                  # test:sequence-qa
└── src/modules/illustrator/
    ├── lib/sequence/
    │   ├── studio-bridge.ts
    │   ├── __tests__/            # FT-001..035 + qa-bridge
    │   └── commands/
    └── components/studio/
        ├── sequence-engine-bindings.tsx
        └── use-sequence-assist.ts
```

## Manual smoke checklist (when e2e skipped)

1. Hard refresh studio (`Cmd+Shift+R`)
2. Paint on layer → hold clip appears
3. Select hold → Convert to Sequence → SEQ badge
4. Two clips Shift+click → Cmd+G → CMP badge
5. Hold → Convert to Reference → dashed clip
6. Double-click sequence/compound → breadcrumb inner edit
7. Escape exits inner edit before closing studio
