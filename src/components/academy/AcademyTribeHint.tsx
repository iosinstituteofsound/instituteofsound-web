import { Link } from 'react-router-dom'
import type { AcademyTrackSlug } from '@/lib/academy/types'
import { suggestTribeSlugForQuizTrack } from '@/lib/academy/academyLoop'
import { tribeBoardPath } from '@/lib/editorial/tagBridge'

interface AcademyTribeHintProps {
  trackSlug: AcademyTrackSlug
  passed?: boolean
}

export function AcademyTribeHint({ trackSlug, passed }: AcademyTribeHintProps) {
  const slug = suggestTribeSlugForQuizTrack(trackSlug)
  if (!slug) return null

  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <p className="academy-tribe-hint text-sm text-muted mt-4">
      {passed ? (
        <>
          Your {name} study path aligns with the{' '}
          <Link to={tribeBoardPath(slug)} className="text-rs-red hover:underline">
            {name} tribe board
          </Link>
          — pick that tribe on the network to attribute weekly dB.
        </>
      ) : (
        <>
          Studying {name}? Consider the{' '}
          <Link to={tribeBoardPath(slug)} className="text-rs-red hover:underline">
            {name} tribe
          </Link>{' '}
          when you join the wire.
        </>
      )}
    </p>
  )
}
