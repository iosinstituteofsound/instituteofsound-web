import { useMemo, useState } from 'react'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolSelectField } from '@/components/tools/ToolSelectField'
import { ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import {
  KEY_ROOTS,
  SCALE_MODE_LABELS,
  analyzeKeyScale,
  formatKeyScaleExport,
  type KeyRoot,
  type ScaleMode,
} from '@/lib/tools/keyScale'

export default function KeyScaleToolPage() {
  const [root, setRoot] = useState<KeyRoot>('E')
  const [mode, setMode] = useState<ScaleMode>('natural_minor')

  const result = useMemo(() => analyzeKeyScale(root, mode), [root, mode])
  const exportText = useMemo(() => formatKeyScaleExport(result), [result])

  return (
    <ToolShell
      toolId="key-scale"
      title="Key & Scale Helper"
      subtitle="Scale notes, diatonic triads, Roman numerals, and relative key pairs."
    >
      <ToolWorkspace
        outputLabel="Scale map"
        controls={
          <div className="ios-tools-fields">
            <ToolSelectField
              id="key-root"
              label="Root"
              value={root}
              onChange={(v) => setRoot(v as KeyRoot)}
              options={KEY_ROOTS.map((r) => ({ value: r, label: r }))}
            />
            <ToolSelectField
              id="key-mode"
              label="Scale / mode"
              value={mode}
              onChange={(v) => setMode(v as ScaleMode)}
              options={(Object.entries(SCALE_MODE_LABELS) as [ScaleMode, string][]).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
        }
        output={
          <>
            <div className="ios-tools-tag-row">
              <span className="ios-tools-tag ios-tools-tag-accent">{result.scaleLabel}</span>
              <span className="ios-tools-tag">{result.roman.join(' ')}</span>
            </div>
            <div className="ios-tools-chord-flow">
              {result.triads.map((c, i) => (
                <div key={`${c}-${i}`} className="ios-tools-chord-chip">
                  <span className="ios-tools-chord-chip-num">{result.degrees[i]}</span>
                  <span className="ios-tools-chord-chip-note">{c}</span>
                </div>
              ))}
            </div>
            <p className="ios-tools-scale-notes">
              <span className="text-muted text-xs uppercase tracking-widest">Notes</span>
              <span>{result.notes.join(' · ')}</span>
            </p>
            <div className="ios-tools-callout mt-4">
              <p>{result.relative}</p>
              <p className="mt-2">{result.parallel}</p>
            </div>
            <CopyOutput value={exportText} label="Copy scale sheet" className="mt-4" />
          </>
        }
      />
    </ToolShell>
  )
}
