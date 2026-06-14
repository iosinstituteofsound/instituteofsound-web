import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useWireDigest } from '@/hooks/useWireDigest'
import { formatWireDigestText } from '@/lib/community/wireEvents'
import { networkProfilePath } from '@/lib/community/networkPaths'

interface WireDigestPanelProps {
  className?: string
}

export function WireDigestPanel({ className }: WireDigestPanelProps) {
  const { digest, loading } = useWireDigest()
  const [copied, setCopied] = useState(false)

  const copyDigest = async () => {
    if (!digest) return
    const text = formatWireDigestText(digest)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <section className={clsx('wire-digest ios-card', className)} aria-labelledby="wire-digest-heading">
      <div className="wire-digest-head">
        <div>
          <p className="ios-kicker" id="wire-digest-heading">
            Wire digest
          </p>
          <p className="font-display text-xl font-bold mt-1">Newsletter template</p>
          <p className="text-sm text-muted mt-1">
            Auto-filled from spins, editorial, tribe war, and weekly challenge — copy for your newsletter or social.
          </p>
        </div>
        <button
          type="button"
          className="wire-digest-copy"
          disabled={!digest || loading}
          onClick={() => void copyDigest()}
        >
          {copied ? 'Copied' : 'Copy digest'}
        </button>
      </div>

      {loading && !digest ? (
        <p className="text-sm text-muted py-4">Building digest…</p>
      ) : digest ? (
        <ul className="wire-digest-list">
          <li>
            <span className="wire-digest-label">Season</span>
            <span>{digest.seasonLabel}</span>
          </li>
          {digest.spinTitle && (
            <li>
              <span className="wire-digest-label">Spin of the week</span>
              <span>
                {digest.spinTitle}
                {digest.spinHandle && (
                  <>
                    {' '}
                    <Link to={networkProfilePath(digest.spinHandle)} className="wire-digest-link">
                      {digest.spinHandle}
                    </Link>
                  </>
                )}
              </span>
            </li>
          )}
          {digest.editorialTitle && digest.editorialSlug && (
            <li>
              <span className="wire-digest-label">Editorial</span>
              <Link to={`/feature/${digest.editorialSlug}`} className="wire-digest-link">
                {digest.editorialTitle}
              </Link>
            </li>
          )}
          {digest.tribeWinnerGenre && (
            <li>
              <span className="wire-digest-label">Tribe war lead</span>
              <span>
                {digest.tribeWinnerGenre}
                {digest.tribeWinnerChampion && ` · ${digest.tribeWinnerChampion}`}
              </span>
            </li>
          )}
          <li>
            <span className="wire-digest-label">Challenge</span>
            <span>{digest.challengeTitle}</span>
          </li>
        </ul>
      ) : null}
    </section>
  )
}
