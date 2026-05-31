import { Link } from 'react-router-dom'
import type { FandomPublicRecognitionRow } from '@/lib/fandom/types'

interface FandomPublicRecognitionsProps {
  recognitions: FandomPublicRecognitionRow[]
  className?: string
}

export function FandomPublicRecognitions({
  recognitions,
  className,
}: FandomPublicRecognitionsProps) {
  if (recognitions.length === 0) return null

  return (
    <section className={className} aria-label="Artist recognition">
      <h2 className="network-rail-title">Artist recognition</h2>
      <ul className="network-recognition-list list-none p-0 m-0">
        {recognitions.map((r) => (
          <li key={r.id} className="network-recognition-item">
            <p className="text-xs text-muted">
              <Link to={`/artists/${r.artistSlug}`} className="text-mh-red hover:underline font-semibold">
                {r.artistDisplayName}
              </Link>
              {' · '}
              {r.kind === 'shoutout' ? 'Shout-out' : 'Thank you'}
              {' · '}
              <time dateTime={r.createdAt}>
                {new Date(r.createdAt).toLocaleDateString()}
              </time>
            </p>
            <p className="text-sm mt-2 leading-relaxed">&ldquo;{r.message}&rdquo;</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
