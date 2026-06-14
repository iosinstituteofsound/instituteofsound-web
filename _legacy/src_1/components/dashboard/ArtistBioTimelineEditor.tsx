import { useState } from 'react'
import type { ArtistBioTimelineEntry } from '@/lib/artist-profile/types'
import {
  addArtistBioTimeline,
  deleteArtistBioTimeline,
  updateArtistBioTimeline,
} from '@/lib/artist-profile/service'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'

interface RowActions {
  onSaved: () => Promise<void>
  onDeleted: () => Promise<void>
}

function EditableTimelineRow({
  entry,
  ...actions
}: { entry: ArtistBioTimelineEntry } & RowActions) {
  const [editing, setEditing] = useState(false)
  const [year, setYear] = useState(String(entry.year))
  const [title, setTitle] = useState(entry.title)
  const [description, setDescription] = useState(entry.description ?? '')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setYear(String(entry.year))
    setTitle(entry.title)
    setDescription(entry.description ?? '')
    setEditing(false)
  }

  const parseYear = () => {
    const y = parseInt(year, 10)
    return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : entry.year
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateArtistBioTimeline(entry.id, {
        year: parseYear(),
        title: title.trim() || entry.title,
        description: description.trim() || undefined,
      })
      setEditing(false)
      await actions.onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex gap-3 items-start border border-border px-3 py-2 text-sm">
        <span className="shrink-0 font-mono text-xs text-mh-red tabular-nums w-10 pt-0.5">
          {entry.year}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{entry.title}</p>
          {entry.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{entry.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="text-xs uppercase ios-link" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="text-mh-red text-xs uppercase"
            onClick={async () => {
              await deleteArtistBioTimeline(entry.id)
              await actions.onDeleted()
            }}
          >
            Remove
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="border border-mh-red/40 px-3 py-4 space-y-3 text-sm">
      <FieldLabel>Edit milestone</FieldLabel>
      <Input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Year (e.g. 2019)"
        inputMode="numeric"
      />
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline" />
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Details (optional)"
        className="ios-input min-h-[60px]"
      />
      <div className="flex gap-2">
        <Button type="button" variant="primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Cancel
        </Button>
      </div>
    </li>
  )
}

interface ArtistBioTimelineEditorProps {
  profileId: string
  entries: ArtistBioTimelineEntry[]
  onChanged: () => Promise<void>
}

export function ArtistBioTimelineEditor({
  profileId,
  entries,
  onChanged,
}: ArtistBioTimelineEditorProps) {
  const [year, setYear] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)

  const parseYear = () => {
    const y = parseInt(year, 10)
    return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : null
  }

  const add = async () => {
    const y = parseYear()
    if (!y || !title.trim()) return
    setAdding(true)
    try {
      await addArtistBioTimeline(profileId, {
        year: y,
        title: title.trim(),
        description: description.trim() || undefined,
      })
      setYear('')
      setTitle('')
      setDescription('')
      await onChanged()
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="ios-panel space-y-4">
      <p className="ios-kicker">Bio timeline</p>
      <p className="text-xs text-muted-foreground">
        Band ki story year-by-year — formed, first release, tours, lineup changes.
      </p>
      <div className="flex flex-wrap gap-2">
        <Input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          className="w-24"
          inputMode="numeric"
        />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Milestone (e.g. Debut EP released)"
          className="flex-1 min-w-[12rem]"
        />
      </div>
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Details (optional)"
        className="ios-input min-h-[60px]"
      />
      <Button
        type="button"
        variant="metal"
        disabled={adding || !parseYear() || !title.trim()}
        onClick={add}
      >
        {adding ? 'Adding…' : 'Add milestone'}
      </Button>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No timeline entries yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {entries.map((entry) => (
            <EditableTimelineRow
              key={entry.id}
              entry={entry}
              onSaved={onChanged}
              onDeleted={onChanged}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
