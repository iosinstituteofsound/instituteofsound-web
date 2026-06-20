import { ExternalLink, Radio } from 'lucide-react'
import type { EventDto } from '@/modules/explore/types/explore.types'
import {
  eventCover,
  eventLocationLine,
  eventTags,
  formatExploreEventDate,
} from '@/modules/explore/lib/event-meta'
import type { EventDraft } from '@/shared/components/editor-events/types'
import { slugifyEventTitle } from '@/shared/components/editor-events/lib/event-desk-utils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'

interface EventDetailPanelProps {
  event: EventDto | null
  draft: EventDraft
  isCreating: boolean
  onDraftChange: (draft: EventDraft) => void
  onSave: () => void
  onDelete?: () => void
  isSaving?: boolean
  isDeleting?: boolean
  labels: {
    detailKicker: string
    detailTitle: string
    createTitle: string
    detailEmpty: string
    saveLabel: string
    createLabel: string
    deleteLabel: string
    savingLabel: string
    titleLabel: string
    slugLabel: string
    venueLabel: string
    startsAtLabel: string
    descriptionLabel: string
    coverUrlLabel: string
    ticketUrlLabel: string
  }
}

export function EventDetailPanel({
  event,
  draft,
  isCreating,
  onDraftChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  labels,
}: EventDetailPanelProps) {
  const showForm = isCreating || Boolean(event)
  const poster = draft.coverUrl || (event ? eventCover(event, 0) : '')
  const when = event ? formatExploreEventDate(event.startsAt) : null
  const tags = event ? eventTags(event) : null

  const updateDraft = (patch: Partial<EventDraft>) => {
    const next = { ...draft, ...patch }
    if (patch.title && (isCreating || !draft.slug || draft.slug === slugifyEventTitle(draft.title))) {
      next.slug = slugifyEventTitle(patch.title)
    }
    onDraftChange(next)
  }

  return (
    <section className="evt-desk__panel evt-desk__panel--detail" aria-labelledby="event-detail-heading">
      <header className="evt-desk__header">
        <div>
          <p className="evt-desk__kicker">{labels.detailKicker}</p>
          <h3 id="event-detail-heading" className="evt-desk__title">
            {isCreating ? labels.createTitle : labels.detailTitle}
          </h3>
        </div>
        {event ? (
          <span className="evt-desk__meta">
            <Radio size={12} aria-hidden />
            {when?.line ?? 'Scheduled'}
          </span>
        ) : null}
      </header>
      <div className="evt-desk__body">
        {!showForm ? (
          <div className="evt-desk__empty evt-desk__detail-empty">{labels.detailEmpty}</div>
        ) : (
          <div className="evt-desk__detail">
            <div className="evt-desk__hero">
              <div className="evt-desk__hero-poster">
                {poster ? <img src={poster} alt="" loading="lazy" /> : null}
              </div>
              <div>
                {tags ? (
                  <div className="evt-desk__badges">
                    <span className="evt-desk__badge">{tags.primary}</span>
                    <span className="evt-desk__badge">{tags.secondary}</span>
                  </div>
                ) : null}
                <h4 className="evt-desk__hero-title">{draft.title || labels.createTitle}</h4>
                <p className="evt-desk__hero-meta">
                  {draft.venue || 'Venue TBA'}
                  {event ? ` · ${eventLocationLine(event)}` : ''}
                </p>
                {draft.ticketUrl ? (
                  <a
                    href={draft.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="evt-desk__hero-meta inline-flex items-center gap-1 mt-2"
                    style={{ color: 'var(--evt-neon)' }}
                  >
                    <ExternalLink size={12} aria-hidden />
                    Ticket link
                  </a>
                ) : null}
              </div>
            </div>

            <div className="evt-desk__form">
              <div className="evt-desk__form-field">
                <label className="evt-desk__label" htmlFor="evt-title">
                  {labels.titleLabel}
                </label>
                <Input
                  id="evt-title"
                  className="evt-desk__input"
                  value={draft.title}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                />
              </div>
              <div className="evt-desk__form-field">
                <label className="evt-desk__label" htmlFor="evt-slug">
                  {labels.slugLabel}
                </label>
                <Input
                  id="evt-slug"
                  className="evt-desk__input"
                  value={draft.slug}
                  onChange={(e) => updateDraft({ slug: e.target.value })}
                />
              </div>
              <div className="evt-desk__form-field">
                <label className="evt-desk__label" htmlFor="evt-venue">
                  {labels.venueLabel}
                </label>
                <Input
                  id="evt-venue"
                  className="evt-desk__input"
                  value={draft.venue}
                  onChange={(e) => updateDraft({ venue: e.target.value })}
                />
              </div>
              <div className="evt-desk__form-field">
                <label className="evt-desk__label" htmlFor="evt-starts">
                  {labels.startsAtLabel}
                </label>
                <Input
                  id="evt-starts"
                  type="datetime-local"
                  className="evt-desk__input"
                  value={draft.startsAt}
                  onChange={(e) => updateDraft({ startsAt: e.target.value })}
                />
              </div>
              <div className="evt-desk__form-field evt-desk__form-field--wide">
                <label className="evt-desk__label" htmlFor="evt-description">
                  {labels.descriptionLabel}
                </label>
                <Textarea
                  id="evt-description"
                  className="evt-desk__textarea"
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                />
              </div>
              <div className="evt-desk__form-field">
                <label className="evt-desk__label" htmlFor="evt-cover">
                  {labels.coverUrlLabel}
                </label>
                <Input
                  id="evt-cover"
                  className="evt-desk__input"
                  value={draft.coverUrl}
                  onChange={(e) => updateDraft({ coverUrl: e.target.value })}
                />
              </div>
              <div className="evt-desk__form-field">
                <label className="evt-desk__label" htmlFor="evt-ticket">
                  {labels.ticketUrlLabel}
                </label>
                <Input
                  id="evt-ticket"
                  className="evt-desk__input"
                  value={draft.ticketUrl}
                  onChange={(e) => updateDraft({ ticketUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="evt-desk__actions">
              <Button className="evt-desk__action" onClick={onSave} disabled={isSaving || isDeleting}>
                {isSaving ? labels.savingLabel : isCreating ? labels.createLabel : labels.saveLabel}
              </Button>
              {!isCreating && event && onDelete ? (
                <Button
                  variant="destructive"
                  className="evt-desk__action"
                  onClick={onDelete}
                  disabled={isSaving || isDeleting}
                >
                  {labels.deleteLabel}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
