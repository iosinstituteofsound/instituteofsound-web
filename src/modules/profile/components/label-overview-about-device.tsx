import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, Loader2, MapPin, Music2, Pencil, UserRound } from 'lucide-react'
import type { LabelOverviewLabelDto } from '@/modules/explore/types/explore.types'
import {
  labelOverviewBasedIn,
  labelOverviewBio,
  labelOverviewFounded,
  labelOverviewFounder,
  labelOverviewGenres,
} from '@/modules/profile/lib/label-overview-format'
import { useUpdateLabelProfile } from '@/modules/profile/hooks/use-update-label-profile'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'
import '@/modules/profile/styles/label-overview-about-device.css'

type LabelOverviewAboutDeviceProps = {
  label: LabelOverviewLabelDto
  editable?: boolean
  userId?: string
  onReadMore?: () => void
}

const SPEC_ROWS = [
  { key: 'founded', label: 'Founded', icon: CalendarDays, resolve: labelOverviewFounded },
  { key: 'founder', label: 'Founder', icon: UserRound, resolve: labelOverviewFounder },
  { key: 'genres', label: 'Genres', icon: Music2, resolve: labelOverviewGenres },
  { key: 'basedIn', label: 'Based In', icon: MapPin, resolve: labelOverviewBasedIn },
] as const

export function LabelOverviewAboutDevice({
  label,
  editable,
  userId,
  onReadMore,
}: LabelOverviewAboutDeviceProps) {
  const [editing, setEditing] = useState(false)
  const [draftBio, setDraftBio] = useState(labelOverviewBio(label))
  const [draftFounded, setDraftFounded] = useState(labelOverviewFounded(label))
  const [draftFounder, setDraftFounder] = useState(labelOverviewFounder(label))
  const [draftGenres, setDraftGenres] = useState(labelOverviewGenres(label))
  const [draftBasedIn, setDraftBasedIn] = useState(labelOverviewBasedIn(label))
  const updateLabel = useUpdateLabelProfile(userId ?? label.userId)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (editing) return
    setDraftBio(labelOverviewBio(label))
    setDraftFounded(labelOverviewFounded(label))
    setDraftFounder(labelOverviewFounder(label))
    setDraftGenres(labelOverviewGenres(label))
    setDraftBasedIn(labelOverviewBasedIn(label))
  }, [label, editing])

  const bio = labelOverviewBio(label)
  const displayLabel = useMemo(
    () => ({
      ...label,
      bio,
      foundedYear: label.foundedYear ?? (Number(labelOverviewFounded(label)) || undefined),
      founderName: labelOverviewFounder(label),
      basedIn: labelOverviewBasedIn(label),
      genres:
        label.genres.length > 0
          ? label.genres
          : labelOverviewGenres(label)
              .split(',')
              .map((genre) => genre.trim())
              .filter(Boolean),
    }),
    [bio, label],
  )

  const startEdit = () => {
    setDraftBio(labelOverviewBio(label))
    setDraftFounded(labelOverviewFounded(label))
    setDraftFounder(labelOverviewFounder(label))
    setDraftGenres(labelOverviewGenres(label))
    setDraftBasedIn(labelOverviewBasedIn(label))
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const saveAbout = async () => {
    const trimmedBio = draftBio.trim()
    if (!trimmedBio) {
      toast.error('Write something for your label overview')
      return
    }

    const foundedYear = Number.parseInt(draftFounded, 10)
    const genres = draftGenres
      .split(',')
      .map((genre) => genre.trim())
      .filter(Boolean)

    try {
      await updateLabel.mutateAsync({
        bio: trimmedBio,
        foundedYear: Number.isFinite(foundedYear) ? foundedYear : null,
        founderName: draftFounder.trim() || null,
        basedIn: draftBasedIn.trim() || null,
        genres,
      })
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: ['profile-label-overview', userId] })
      }
      setEditing(false)
      toast.success('Label overview saved')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not save label overview'
      toast.error(message)
    }
  }

  return (
    <aside
      className={cn('lbl-ov-about', editable && 'lbl-ov-about--editable', editing && 'lbl-ov-about--editing')}
      aria-labelledby="lbl-ov-about-heading"
    >
      <div className="lbl-ov-about__chassis">
        <span className="lbl-ov-about__halo" aria-hidden />
        <span className="lbl-ov-about__grid" aria-hidden />
        <span className="lbl-ov-about__scanline" aria-hidden />
        <span className="lbl-ov-about__rail" aria-hidden />

        <span className="lbl-ov-about__corner lbl-ov-about__corner--tl" aria-hidden />
        <span className="lbl-ov-about__corner lbl-ov-about__corner--tr" aria-hidden />
        <span className="lbl-ov-about__corner lbl-ov-about__corner--bl" aria-hidden />
        <span className="lbl-ov-about__corner lbl-ov-about__corner--br" aria-hidden />

        <span className="lbl-ov-about__bolt lbl-ov-about__bolt--tl" aria-hidden />
        <span className="lbl-ov-about__bolt lbl-ov-about__bolt--tr" aria-hidden />
        <span className="lbl-ov-about__bolt lbl-ov-about__bolt--bl" aria-hidden />
        <span className="lbl-ov-about__bolt lbl-ov-about__bolt--br" aria-hidden />

        <header className="lbl-ov-about__header">
          <span className="lbl-ov-about__vents" aria-hidden />
          <div className="lbl-ov-about__header-left">
            <span className="lbl-ov-about__led-cluster" aria-hidden>
              <span className="lbl-ov-about__led" />
              <span className="lbl-ov-about__led lbl-ov-about__led--dim" />
            </span>
            <span className="lbl-ov-about__signal" aria-hidden />
            <p id="lbl-ov-about-heading" className="lbl-ov-about__title">
              About the Label
            </p>
          </div>

          {editable ? (
            <div className="lbl-ov-about__header-actions">
              <span className="lbl-ov-about__head-meta lbl-ov-about__head-meta--live">LIVE</span>
              <button
                type="button"
                className="lbl-ov-about__head-meta lbl-ov-about__head-meta--edit"
                onClick={startEdit}
                aria-label="Edit about the label"
              >
                <Pencil size={10} strokeWidth={2} aria-hidden />
                Edit
              </button>
            </div>
          ) : null}
        </header>

        <div className="lbl-ov-about__screen">
          <span className="lbl-ov-about__screen-corner lbl-ov-about__screen-corner--tl" aria-hidden />
          <span className="lbl-ov-about__screen-corner lbl-ov-about__screen-corner--tr" aria-hidden />
          <span className="lbl-ov-about__screen-corner lbl-ov-about__screen-corner--bl" aria-hidden />
          <span className="lbl-ov-about__screen-corner lbl-ov-about__screen-corner--br" aria-hidden />
          <span className="lbl-ov-about__screen-scan" aria-hidden />

          {editing ? (
            <div className="lbl-ov-about__editor">
              <label className="lbl-ov-about__editor-label" htmlFor="lbl-ov-about-bio">
                :: Label transmission
              </label>
              <Textarea
                id="lbl-ov-about-bio"
                value={draftBio}
                onChange={(event) => setDraftBio(event.target.value)}
                rows={4}
                className="lbl-ov-about__editor-input"
              />

              <div className="lbl-ov-about__editor-grid">
                <label className="lbl-ov-about__editor-field">
                  <span>Founded</span>
                  <Input value={draftFounded} onChange={(event) => setDraftFounded(event.target.value)} />
                </label>
                <label className="lbl-ov-about__editor-field">
                  <span>Founder</span>
                  <Input value={draftFounder} onChange={(event) => setDraftFounder(event.target.value)} />
                </label>
                <label className="lbl-ov-about__editor-field lbl-ov-about__editor-field--wide">
                  <span>Genres (comma separated)</span>
                  <Input value={draftGenres} onChange={(event) => setDraftGenres(event.target.value)} />
                </label>
                <label className="lbl-ov-about__editor-field lbl-ov-about__editor-field--wide">
                  <span>Based in</span>
                  <Input value={draftBasedIn} onChange={(event) => setDraftBasedIn(event.target.value)} />
                </label>
              </div>

              <div className="lbl-ov-about__editor-actions">
                <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={saveAbout} disabled={updateLabel.isPending}>
                  {updateLabel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="lbl-ov-about__bio">{bio}</p>

              {onReadMore ? (
                <button type="button" className="lbl-ov-about__read-more" onClick={onReadMore}>
                  Read More
                  <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>

        {!editing ? (
          <>
            <div className="lbl-ov-about__divider" aria-hidden>
              <span className="lbl-ov-about__divider-cap" aria-hidden />
              <span className="lbl-ov-about__divider-line" aria-hidden />
              <span className="lbl-ov-about__divider-cap lbl-ov-about__divider-cap--end" aria-hidden />
            </div>

            <dl className="lbl-ov-about__specs">
              {SPEC_ROWS.map(({ key, label: rowLabel, icon: Icon, resolve }, index) => (
                <div key={key} className="lbl-ov-about__spec-row">
                  <span className="lbl-ov-about__spec-idx" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <dt className="lbl-ov-about__spec-label">
                    <span className="lbl-ov-about__spec-icon" aria-hidden>
                      <Icon size={12} strokeWidth={2} />
                    </span>
                    {rowLabel}
                  </dt>
                  <dd className="lbl-ov-about__spec-value">{resolve(displayLabel)}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}

        <footer className="lbl-ov-about__footer" aria-hidden>
          <span className="lbl-ov-about__footer-tag">IOS::LABEL::SPEC</span>
          <span className="lbl-ov-about__footer-pulse" />
          <span className="lbl-ov-about__footer-tag">SYNC OK</span>
        </footer>
      </div>
    </aside>
  )
}
