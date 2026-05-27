import { useState } from 'react'
import { ToolActionButton, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolDropCta } from '@/components/tools/ToolDropCta'
import { ToolSelectField } from '@/components/tools/ToolSelectField'
import {
  CHORD_VIBES,
  generateChordProgression,
  ROOTS,
  SCALE_LABELS,
  type ChordProgressionInput,
  type ProgressionVibe,
  type ScaleType,
} from '@/lib/tools/chords'

export default function ChordToolPage() {
  const [input, setInput] = useState<ChordProgressionInput>({
    root: 'E',
    scale: 'natural_minor',
    vibe: 'dark',
    bars: 4,
  })
  const [result, setResult] = useState<ReturnType<typeof generateChordProgression> | null>(null)

  const generate = () => setResult(generateChordProgression(input))

  const output = result
    ? `${result.scaleLabel}\nRoman: ${result.roman}\n\n${result.chords.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : ''

  return (
    <ToolShell
      toolId="chords"
      title="Chord Progression Generator"
      subtitle="Theory engine with Roman numerals and visual chord flow."
    >
      <ToolWorkspace
        outputLabel="Progression map"
        controls={
          <div className="ios-tools-fields">
            <ToolSelectField
              id="root"
              label="Root note"
              value={input.root}
              onChange={(v) => setInput((s) => ({ ...s, root: v }))}
              options={ROOTS.map((r) => ({ value: r, label: r }))}
            />
            <ToolSelectField
              id="scale"
              label="Scale"
              value={input.scale}
              onChange={(v) => setInput((s) => ({ ...s, scale: v as ScaleType }))}
              options={(Object.entries(SCALE_LABELS) as [ScaleType, string][]).map(
                ([value, label]) => ({ value, label })
              )}
            />
            <ToolSelectField
              id="vibe"
              label="Vibe"
              value={input.vibe}
              onChange={(v) => setInput((s) => ({ ...s, vibe: v as ProgressionVibe }))}
              options={CHORD_VIBES.map((v) => ({
                value: v,
                label: v.charAt(0).toUpperCase() + v.slice(1),
              }))}
            />
            <ToolSelectField
              id="bars"
              label="Length"
              value={String(input.bars)}
              onChange={(v) => setInput((s) => ({ ...s, bars: Number(v) as 4 | 8 }))}
              options={[
                { value: '4', label: '4 chords' },
                { value: '8', label: '8 chords' },
              ]}
            />
            <ToolActionButton onClick={generate}>Generate progression</ToolActionButton>
          </div>
        }
        output={
          result ? (
            <>
              <div className="ios-tools-tag-row">
                <span className="ios-tools-tag ios-tools-tag-accent">{result.scaleLabel}</span>
                <span className="ios-tools-tag">{result.roman}</span>
              </div>
              <div className="ios-tools-chord-flow">
                {result.chords.map((c, i) => (
                  <div key={`${c}-${i}`} className="ios-tools-chord-chip">
                    <span className="ios-tools-chord-chip-num">Bar {i + 1}</span>
                    <span className="ios-tools-chord-chip-note">{c.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <CopyOutput value={output} label="Copy progression" />
              <ToolDropCta
                toolName="Chord Progression"
                detail={`${result.scaleLabel} · ${result.chords.join(' → ')}`}
              />
            </>
          ) : (
            <CopyOutput
              value=""
              label="Copy progression"
              emptyMessage="Pick root, scale, and vibe — then hit Generate."
            />
          )
        }
      />
    </ToolShell>
  )
}
