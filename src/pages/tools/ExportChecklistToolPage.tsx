import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolTextAreaField } from '@/components/tools/ToolSelectField'
import { ToolActionButton, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import {
  EXPORT_CHECKLIST_ITEMS,
  buildChecklistReport,
  formatChecklistExport,
} from '@/lib/tools/exportChecklist'

export default function ExportChecklistToolPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const report = useMemo(() => buildChecklistReport(checked, notes), [checked, notes])
  const exportText = useMemo(() => formatChecklistExport(checked, notes), [checked, notes])

  const categories = useMemo(() => {
    const map = new Map<string, typeof EXPORT_CHECKLIST_ITEMS>()
    EXPORT_CHECKLIST_ITEMS.forEach((item) => {
      const arr = map.get(item.category) ?? []
      arr.push(item)
      map.set(item.category, arr)
    })
    return [...map.entries()]
  }, [])

  return (
    <ToolShell
      toolId="export-checklist"
      title="Mix / Export Checklist"
      subtitle="Pre-release QC — levels, format, metadata, and listening checks."
    >
      <ToolWorkspace
        outputLabel="Progress"
        controls={
          <div className="ios-tools-fields">
            {categories.map(([category, items]) => (
              <div key={category} className="ios-tools-checklist-group">
                <p className="ios-tools-checklist-cat">{category}</p>
                <ul className="ios-tools-checklist">
                  {items.map((item) => (
                    <li key={item.id}>
                      <label className="ios-tools-checklist-item">
                        <input
                          type="checkbox"
                          checked={checked.has(item.id)}
                          onChange={() => toggle(item.id)}
                        />
                        <span>
                          <strong>{item.label}</strong>
                          <span className="ios-tools-checklist-tip">{item.tip}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <ToolTextAreaField
              id="checklist-notes"
              label="Session notes"
              value={notes}
              onChange={setNotes}
              placeholder="Mastering chain, reference track, deadline…"
              rows={3}
            />
            <ToolActionButton variant="ghost" onClick={() => setChecked(new Set())}>
              Reset checklist
            </ToolActionButton>
          </div>
        }
        output={
          <>
            <div className="ios-tools-checklist-progress">
              <span className="ios-tools-checklist-pct">{report.percent}%</span>
              <div className="ios-tools-meter-track">
                <span
                  className="ios-tools-meter-fill"
                  style={{ width: `${report.percent}%` }}
                />
              </div>
            </div>
            <div className="ios-tools-checklist-summary">
              {Object.entries(report.byCategory).map(([cat, v]) => (
                <span
                  key={cat}
                  className={clsx(
                    'ios-tools-tag',
                    v.done === v.total && 'ios-tools-tag-accent'
                  )}
                >
                  {cat} {v.done}/{v.total}
                </span>
              ))}
            </div>
            <CopyOutput value={exportText} label="Copy checklist report" className="mt-4" />
          </>
        }
      />
    </ToolShell>
  )
}
