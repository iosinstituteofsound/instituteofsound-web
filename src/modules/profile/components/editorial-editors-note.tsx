import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil } from 'lucide-react'
import type { EditorsNoteDto } from '@/modules/explore/types/explore.types'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'
import '@/modules/profile/styles/editorial-note-device.css'

const DEFAULT_NOTE_PLACEHOLDER =
  "I'm here to document the sounds that don't always make the noise but shape the culture."

type EditorialEditorsNoteProps = {
  note: EditorsNoteDto
  editable?: boolean
  userId?: string
}

export function EditorialEditorsNote({ note, editable, userId }: EditorialEditorsNoteProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note.quote)
  const updateProfile = useUpdateProfile()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!editing) setDraft(note.quote)
  }, [note.quote, editing])

  const startEdit = () => {
    setDraft(note.quote)
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraft(note.quote)
    setEditing(false)
  }

  const saveNote = async () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      toast.error('Write something for your editor\'s note')
      return
    }

    try {
      await updateProfile.mutateAsync({ editorsNote: trimmed })
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: ['profile-editorial-desk', userId] })
      }
      setEditing(false)
      toast.success('Editor\'s note saved')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not save editor\'s note'
      toast.error(message)
    }
  }

  return (
    <aside
      className={cn('ed-note-dev', editable && 'ed-note-dev--editable', editing && 'ed-note-dev--editing')}
      aria-labelledby="ed-note-dev-heading"
    >
      <div className="ed-note-dev__chassis">
        <span className="ed-note-dev__notch ed-note-dev__notch--tl" aria-hidden />
        <span className="ed-note-dev__notch ed-note-dev__notch--tr" aria-hidden />
        <span className="ed-note-dev__notch ed-note-dev__notch--bl" aria-hidden />
        <span className="ed-note-dev__notch ed-note-dev__notch--br" aria-hidden />

        <header className="ed-note-dev__header">
          <span className="ed-note-dev__vents" aria-hidden />
          <div className="ed-note-dev__header-left">
            <span className="ed-note-dev__led-cluster" aria-hidden>
              <span className="ed-note-dev__led" />
              <span className="ed-note-dev__led ed-note-dev__led--dim" />
            </span>
            <span className="ed-note-dev__module-id">EN-01</span>
          </div>
          <div className="ed-note-dev__header-center">
            <p className="ed-note-dev__kicker">:: Desk channel</p>
            <h2 id="ed-note-dev-heading" className="ed-note-dev__title">
              Editor&apos;s Note
            </h2>
          </div>

          {editable ? (
            <div className="ed-note-dev__header-actions">
              <span className="ed-note-dev__header-meta ed-note-dev__header-meta--live">LIVE</span>
              <button
                type="button"
                className="ed-note-dev__header-meta ed-note-dev__header-meta--edit"
                onClick={startEdit}
                aria-label="Edit editor's note"
              >
                <Pencil size={10} strokeWidth={2} aria-hidden />
                Edit
              </button>
            </div>
          ) : (
            <span className="ed-note-dev__header-meta ed-note-dev__header-meta--live">LIVE</span>
          )}
        </header>

        <div className="ed-note-dev__screen">
          <span className="ed-note-dev__screen-bezel" aria-hidden />
          <span className="ed-note-dev__screen-grid" aria-hidden />
          <span className="ed-note-dev__screen-scan" aria-hidden />
          <span className="ed-note-dev__screen-glow" aria-hidden />
          <span className="ed-note-dev__screen-noise" aria-hidden />

          {editing ? (
            <div className="ed-note-dev__editor">
              <label className="ed-note-dev__editor-label" htmlFor="ed-note-draft">
                :: Compose transmission
              </label>
              <Textarea
                id="ed-note-draft"
                className="ed-note-dev__textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={DEFAULT_NOTE_PLACEHOLDER}
                maxLength={500}
                rows={5}
                autoFocus
              />
              <div className="ed-note-dev__editor-actions">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ed-note-dev__btn ed-note-dev__btn--ghost"
                  onClick={cancelEdit}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="ed-note-dev__btn"
                  onClick={() => void saveNote()}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save note
                </Button>
              </div>
            </div>
          ) : (
            <div className="ed-note-dev__display">
              <span className="ed-note-dev__quote-mark" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="ed-note-dev__quote">{note.quote}</blockquote>
              <footer className="ed-note-dev__foot">
                <span className="ed-note-dev__signature">{note.signature}</span>
                <span className="ed-note-dev__author">— {note.authorName}</span>
              </footer>
            </div>
          )}
        </div>

        <footer className="ed-note-dev__status">
          <span className="ed-note-dev__status-item">
            <span className="ed-note-dev__status-dot" aria-hidden />
            {editing ? 'TX composing' : 'TX active'}
          </span>
          <span className="ed-note-dev__status-item">{editing ? 'SIG open' : 'SIG locked'}</span>
          <span className="ed-note-dev__status-item">v1.0</span>
        </footer>
      </div>
    </aside>
  )
}
