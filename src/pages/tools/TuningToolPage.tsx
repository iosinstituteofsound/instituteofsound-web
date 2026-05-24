import { useMemo, useState } from 'react'
import { ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolSelectField } from '@/components/tools/ToolSelectField'
import { formatTuningReference, NOTE_FREQ, TUNINGS } from '@/lib/tools/tuning'

export default function TuningToolPage() {
  const [tuningId, setTuningId] = useState(TUNINGS[0]!.id)

  const tuning = useMemo(() => TUNINGS.find((t) => t.id === tuningId) ?? TUNINGS[0]!, [tuningId])
  const output = useMemo(() => formatTuningReference(tuning), [tuning])

  const allStrings = [
    ...tuning.guitar.map((note, i) => ({
      label: `Guitar ${tuning.guitar.length - i}`,
      note,
    })),
    ...(tuning.bass ?? []).map((note, i) => ({
      label: `Bass ${tuning.bass!.length - i}`,
      note,
    })),
  ]

  return (
    <ToolShell
      toolId="tuning"
      title="Tuning Reference"
      subtitle="Interactive neck map with Hz reference for guitar and bass."
    >
      <ToolWorkspace
        outputLabel="Neck map"
        controls={
          <div className="ios-tools-fields">
            <ToolSelectField
              id="tuning"
              label="Tuning preset"
              value={tuningId}
              onChange={setTuningId}
              options={TUNINGS.map((t) => ({ value: t.id, label: t.name }))}
            />
            <p className="text-sm text-muted leading-relaxed">{tuning.description}</p>
          </div>
        }
        output={
          <>
            <div className="ios-tools-neck">
              {allStrings.map(({ label, note }) => (
                <div key={`${label}-${note}`} className="ios-tools-neck-string">
                  <span className="ios-tools-neck-label">{label}</span>
                  <span className="ios-tools-neck-line" />
                  <span className="ios-tools-neck-note">
                    {note}
                    <span className="text-muted text-xs ml-1">
                      {NOTE_FREQ[note] ? `${NOTE_FREQ[note]!.toFixed(0)}Hz` : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <table className="ios-tools-table mt-4">
              <thead>
                <tr>
                  <th>String</th>
                  <th>Note</th>
                  <th>Hz</th>
                </tr>
              </thead>
              <tbody>
                {allStrings.map(({ label, note }) => (
                  <tr key={`t-${label}`}>
                    <td className="text-muted">{label}</td>
                    <td className="font-mono text-signal">{note}</td>
                    <td>{NOTE_FREQ[note]?.toFixed(1) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <CopyOutput value={output} label="Copy reference" className="mt-4" />
          </>
        }
      />
    </ToolShell>
  )
}
