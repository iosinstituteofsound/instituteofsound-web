import { ExternalLink, Play, Radio } from 'lucide-react'
import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { SubmissionStatusBadge } from '@/shared/components/editor-submissions/components/submission-status-badge'
import {
  formatSubmissionDate,
  submissionGenreLabel,
  submissionInitials,
} from '@/shared/components/editor-submissions/lib/submission-utils'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

interface SubmissionReviewPanelProps {
  submission: TrackSubmissionDto | null
  editorNotes: string
  onEditorNotesChange: (notes: string) => void
  onReview: (status: TrackSubmissionDto['status']) => void
  isReviewing?: boolean
  labels: {
    reviewKicker: string
    reviewTitle: string
    reviewEmpty: string
    notesPlaceholder: string
    inReviewLabel: string
    approveLabel: string
    rejectLabel: string
    savingLabel: string
    artistLabel: string
    projectLabel: string
    genreLabel: string
    submittedLabel: string
    reviewedLabel: string
    descriptionLabel: string
    openStreamLabel: string
  }
}

export function SubmissionReviewPanel({
  submission,
  editorNotes,
  onEditorNotesChange,
  onReview,
  isReviewing,
  labels,
}: SubmissionReviewPanelProps) {
  const playTrack = usePlayerStore((state) => state.playTrack)

  const handlePlay = () => {
    if (!submission?.streamUrl) return
    playTrack({
      id: submission.id,
      title: submission.trackTitle,
      artist: submission.artistName ?? submission.projectName,
      audioUrl: submission.streamUrl,
      artworkUrl: submission.coverUrl,
    })
  }

  return (
    <section
      className="sub-desk__panel sub-desk__panel--review"
      aria-labelledby="submission-review-heading"
    >
      <header className="sub-desk__header">
        <div>
          <p className="sub-desk__kicker">{labels.reviewKicker}</p>
          <h3 id="submission-review-heading" className="sub-desk__title">
            {labels.reviewTitle}
          </h3>
        </div>
        {submission ? (
          <span className="sub-desk__meta">
            <Radio size={12} aria-hidden />
            {submission.status.replace('_', ' ')}
          </span>
        ) : null}
      </header>
      <div className="sub-desk__body">
        {!submission ? (
          <div className="sub-desk__empty sub-desk__review-empty">{labels.reviewEmpty}</div>
        ) : (
          <div className="sub-desk__review">
            <div className="sub-desk__hero">
              <div className="sub-desk__hero-art">
                {submission.coverUrl ? (
                  <img src={submission.coverUrl} alt="" loading="lazy" />
                ) : (
                  <div className="sub-desk__art-fallback">{submissionInitials(submission.trackTitle)}</div>
                )}
              </div>
              <div>
                <SubmissionStatusBadge status={submission.status} />
                <h4 className="sub-desk__hero-title">{submission.trackTitle}</h4>
                <p className="sub-desk__hero-artist">
                  {submission.artistName ?? 'Unknown artist'}
                  {submission.artistEmail ? ` · ${submission.artistEmail}` : ''}
                </p>
              </div>
            </div>

            <div className="sub-desk__meta-grid">
              <div className="sub-desk__meta-item">
                <p className="sub-desk__meta-label">{labels.artistLabel}</p>
                <p className="sub-desk__meta-value">{submission.artistName ?? '—'}</p>
              </div>
              <div className="sub-desk__meta-item">
                <p className="sub-desk__meta-label">{labels.projectLabel}</p>
                <p className="sub-desk__meta-value">{submission.projectName}</p>
              </div>
              <div className="sub-desk__meta-item">
                <p className="sub-desk__meta-label">{labels.genreLabel}</p>
                <p className="sub-desk__meta-value">{submissionGenreLabel(submission.genre)}</p>
              </div>
              <div className="sub-desk__meta-item">
                <p className="sub-desk__meta-label">{labels.submittedLabel}</p>
                <p className="sub-desk__meta-value">{formatSubmissionDate(submission.createdAt)}</p>
              </div>
              {submission.reviewedAt ? (
                <div className="sub-desk__meta-item">
                  <p className="sub-desk__meta-label">{labels.reviewedLabel}</p>
                  <p className="sub-desk__meta-value">
                    {formatSubmissionDate(submission.reviewedAt)}
                    {submission.reviewedByName ? ` · ${submission.reviewedByName}` : ''}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="sub-desk__description">
              <p className="sub-desk__meta-label">{labels.descriptionLabel}</p>
              <p>{submission.description || 'No description provided.'}</p>
            </div>

            <div className="sub-desk__player">
              <button
                type="button"
                className="sub-desk__play-btn"
                aria-label={`Play ${submission.trackTitle}`}
                onClick={handlePlay}
              >
                <Play size={14} strokeWidth={2} fill="currentColor" />
              </button>
              <audio controls src={submission.streamUrl} className="sub-desk__player-audio" />
              <a
                href={submission.streamUrl}
                target="_blank"
                rel="noreferrer"
                className="sub-desk__link"
              >
                <ExternalLink size={12} className="inline mr-1" aria-hidden />
                {labels.openStreamLabel}
              </a>
            </div>

            <Textarea
              className="sub-desk__notes"
              placeholder={labels.notesPlaceholder}
              value={editorNotes}
              onChange={(event) => onEditorNotesChange(event.target.value)}
            />

            <div className="sub-desk__actions">
              <Button
                size="sm"
                variant="outline"
                className="sub-desk__action"
                disabled={isReviewing}
                onClick={() => onReview('in_review')}
              >
                {isReviewing ? labels.savingLabel : labels.inReviewLabel}
              </Button>
              <Button
                size="sm"
                className="sub-desk__action"
                disabled={isReviewing}
                onClick={() => onReview('approved')}
              >
                {labels.approveLabel}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="sub-desk__action"
                disabled={isReviewing}
                onClick={() => onReview('rejected')}
              >
                {labels.rejectLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
