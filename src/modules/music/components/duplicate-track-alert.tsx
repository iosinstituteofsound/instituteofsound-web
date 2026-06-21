import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DuplicateOriginalRef, TrackDuplicateInfo, UploadDuplicateCheck } from '@/modules/music/types/music.types'
import { cn } from '@/shared/lib/cn'

type DuplicateTrackAlertProps = {
  matchScore?: number
  matchConfidence?: TrackDuplicateInfo['matchConfidence']
  original?: DuplicateOriginalRef
  duplicateInfo?: TrackDuplicateInfo
  duplicateCheck?: UploadDuplicateCheck
  variant?: 'inline' | 'banner'
  className?: string
}

function resolveDuplicatePayload(props: DuplicateTrackAlertProps) {
  if (props.duplicateInfo?.isDuplicate) {
    return {
      matchScore: props.duplicateInfo.matchScore ?? props.matchScore,
      matchConfidence: props.duplicateInfo.matchConfidence,
      original: props.duplicateInfo.original ?? props.original,
    }
  }

  if (props.duplicateCheck?.status === 'flagged') {
    return {
      matchScore: props.duplicateCheck.matchScore ?? props.matchScore,
      matchConfidence: props.duplicateCheck.matchConfidence,
      original: props.duplicateCheck.original ?? props.original,
    }
  }

  if (props.original) {
    return {
      matchScore: props.matchScore,
      matchConfidence: props.matchConfidence,
      original: props.original,
    }
  }

  return null
}

export function DuplicateTrackAlert({
  matchScore,
  original,
  duplicateInfo,
  duplicateCheck,
  variant = 'banner',
  className,
}: DuplicateTrackAlertProps) {
  const payload = resolveDuplicatePayload({
    matchScore,
    original,
    duplicateInfo,
    duplicateCheck,
  })

  if (!payload?.original) return null

  const scoreLabel =
    payload.matchScore != null ? `${Math.round(payload.matchScore)}% similarity` : 'high similarity'

  const confidenceLabel =
    payload.matchConfidence === 'likely'
      ? 'Likely remaster/republish'
      : 'Republished duplicate'

  if (variant === 'inline') {
    return (
      <p className={cn('text-xs text-amber-600 dark:text-amber-400', className)}>
        {confidenceLabel} ({scoreLabel}). Upload blocked.{' '}
        <Link to={`/tracks/${payload.original.trackId}`} className="underline underline-offset-2">
          View original
        </Link>
      </p>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-100',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{confidenceLabel}</p>
        <p className="text-sm opacity-90">
          This audio matches an existing track ({scoreLabel}).
          {payload.matchConfidence === 'likely'
            ? ' The audio appears remastered or heavily processed but is likely the same recording.'
            : ' Upload was blocked and nothing was saved to storage.'}
        </p>
        <p className="text-sm">
          Original:{' '}
          <Link to={`/tracks/${payload.original.trackId}`} className="font-medium underline underline-offset-2">
            {payload.original.title} — {payload.original.artistName}
          </Link>
        </p>
      </div>
    </div>
  )
}

export function DuplicateTrackBadge({
  duplicateInfo,
  className,
}: {
  duplicateInfo?: TrackDuplicateInfo
  className?: string
}) {
  if (!duplicateInfo?.isDuplicate) return null

  const label = duplicateInfo.matchConfidence === 'likely' ? 'Likely duplicate' : 'Duplicate'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300',
        className,
      )}
    >
      {label}
    </span>
  )
}
