import { useState } from 'react'
import type { ArtistLineupEntry, LineupEntryType } from '@/lib/artist-profile/types'
import {
  addArtistLineup,
  deleteArtistLineup,
  updateArtistLineup,
} from '@/lib/artist-profile/service'
import { LINEUP_ENTRY_TYPES, LINEUP_TYPE_LABELS } from '@/lib/artist-profile/lineup'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'

interface RowActions {
  onSaved: () => Promise<void>
  onDeleted: () => Promise<void>
}

function EditableLineupRow({ entry, ...actions }: { entry: ArtistLineupEntry } & RowActions) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(entry.name)
  const [role, setRole] = useState(entry.role)
  const [entryType, setEntryType] = useState<LineupEntryType>(entry.entryType)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName(entry.name)
    setRole(entry.role)
    setEntryType(entry.entryType)
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateArtistLineup(entry.id, {
        name: name.trim() || entry.name,
        role: role.trim() || entry.role,
        entryType,
      })
      setEditing(false)
      await actions.onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex gap-3 items-center border border-border px-3 py-2 text-sm">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{entry.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{entry.role}</p>
          <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider mt-0.5">
            {LINEUP_TYPE_LABELS[entry.entryType]}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="text-xs uppercase ios-link" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="text-mh-red text-xs uppercase"
            onClick={async () => {
              await deleteArtistLineup(entry.id)
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
      <FieldLabel>Edit credit</FieldLabel>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role / credit" />
      <div>
        <FieldLabel>Category</FieldLabel>
        <select
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as LineupEntryType)}
          className="ios-input w-full"
        >
          {LINEUP_ENTRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {LINEUP_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
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

interface ArtistLineupEditorProps {
  profileId: string
  entries: ArtistLineupEntry[]
  onChanged: () => Promise<void>
}

export function ArtistLineupEditor({ profileId, entries, onChanged }: ArtistLineupEditorProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [entryType, setEntryType] = useState<LineupEntryType>('member')
  const [adding, setAdding] = useState(false)

  const add = async () => {
    if (!name.trim() || !role.trim()) return
    setAdding(true)
    try {
      await addArtistLineup(profileId, {
        name: name.trim(),
        role: role.trim(),
        entryType,
      })
      setName('')
      setRole('')
      setEntryType('member')
      await onChanged()
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="ios-panel space-y-4">
      <p className="ios-kicker">Band lineup & credits</p>
      <p className="text-xs text-muted-foreground">
        Members, guest musicians, aur production credits — press kit & profile par dikhenge.
      </p>
      <div className="space-y-2">
        <Input
          placeholder="Name (e.g. Rahul Verma)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Role (e.g. Vocals, Drums, Mix & master)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <div>
          <FieldLabel>Category</FieldLabel>
          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as LineupEntryType)}
            className="ios-input w-full"
          >
            {LINEUP_ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {LINEUP_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button
        type="button"
        variant="metal"
        disabled={adding || !name.trim() || !role.trim()}
        onClick={add}
      >
        {adding ? 'Adding…' : 'Add to lineup'}
      </Button>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No lineup entries yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {entries.map((entry) => (
            <EditableLineupRow
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
