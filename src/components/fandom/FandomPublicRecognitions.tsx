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
      <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold mb-2">
        Artist recognition
      </p>
      <ul className="space-y-3 list-none p-0 m-0">
        {recognitions.map((r) => (
          <li key={r.id} className="ios-card p-4 border border-white/5">
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
