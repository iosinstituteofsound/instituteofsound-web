import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  fetchEditorWirePicks,
  type EditorWirePick,
} from '@/lib/editorial/editorialBridge'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'

interface EditorWirePicksPanelProps {
  onLinkToDraft?: (postId: string) => void
  selectedPostId?: string | null
  className?: string
}

export function EditorWirePicksPanel({
  onLinkToDraft,
  selectedPostId,
  className,
}: EditorWirePicksPanelProps) {
  const [picks, setPicks] = useState<EditorWirePick[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setPicks(await fetchEditorWirePicks(12))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <section className={clsx('editor-wire-picks', className)} aria-labelledby="wire-picks-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 id="wire-picks-heading" className="font-display text-xl font-bold">
            Wire picks this week
          </h2>
          <p className="text-sm text-muted mt-1">
            Top community spins by reactions — link one when writing a feature or review.
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} className="ios-btn ios-btn-ghost !text-xs">
          Refresh
        </button>
      </div>

      {loading && picks.length === 0 && (
        <p className="text-sm text-muted py-8 text-center border border-dashed border-border">
          Loading wire…
        </p>
      )}

      {!loading && picks.length === 0 && (
        <p className="text-sm text-muted py-8 text-center border border-dashed border-border">
          No spins with reactions this week yet. Check the{' '}
          <Link to="/community" className="text-rs-red hover:underline">
            network feed
          </Link>
          .
        </p>
      )}

      <ul className="editor-wire-picks-list">
        {picks.map((pick, index) => {
          const spotify = pick.spotifyUrl ? parseSpotifyUrl(pick.spotifyUrl) : null
          const youtube = pick.youtubeUrl ? parseYouTubeUrl(pick.youtubeUrl) : null
          const linked = selectedPostId === pick.id
          return (
            <li
              key={pick.id}
              className={clsx('editor-wire-pick ios-card', linked && 'editor-wire-pick-linked')}
            >
              <div className="editor-wire-pick-head">
                <span className="editor-wire-pick-rank">#{index + 1}</span>
                <div className="editor-wire-pick-meta">
                  <p className="font-display font-bold">
                    {pick.trackTitle ?? 'Untitled spin'}
                  </p>
                  <Link
                    to={networkProfilePath(pick.handle)}
                    className="text-xs text-muted hover:text-rs-red"
                  >
                    {pick.displayName} · {pick.reactionScore} reactions
                  </Link>
                </div>
              </div>
              {(spotify || youtube) && (
                <p className="text-xs text-muted mt-2 truncate">
                  {spotify ? 'Spotify' : 'YouTube'} linked
                </p>
              )}
              <div className="editor-wire-pick-actions">
                <Link
                  to={networkProfilePath(pick.handle)}
                  className="ios-btn ios-btn-ghost !text-[10px]"
                >
                  Profile
                </Link>
                {onLinkToDraft && (
                  <button
                    type="button"
                    className="ios-btn ios-btn-primary !text-[10px]"
                    onClick={() => onLinkToDraft(pick.id)}
                  >
                    {linked ? 'Linked to draft' : 'Link to editorial'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
