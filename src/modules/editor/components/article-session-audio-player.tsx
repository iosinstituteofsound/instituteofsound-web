import { AudioLines, ExternalLink, ListMusic, Play } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSessionAudioTracks } from '@/modules/editor/hooks/use-session-audio-tracks'
import { parseExternalAudioLink } from '@/modules/editor/lib/external-audio-link'
import { pickActiveTrackIndex } from '@/modules/editor/lib/session-audio-tracks'
import type { SessionAudioTrack } from '@/modules/editor/lib/session-audio-tracks'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import { cn } from '@/shared/lib/cn'

const DIRECT_STREAM_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)(\?|#|$)/i

function isDirectPlayable(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (DIRECT_STREAM_EXT.test(trimmed)) return true
  if (trimmed.includes('/preview')) return true
  if (trimmed.includes('soundhelix.com')) return true
  return false
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function trackPlaybackUrl(track: SessionAudioTrack): string {
  if (isDirectPlayable(track.streamUrl)) return track.streamUrl
  const parsed = parseExternalAudioLink(track.streamUrl)
  return parsed.embedUrl ?? parsed.streamUrl ?? track.streamUrl
}

interface ArticleSessionAudioPlayerProps {
  audioUrl: string
  trackTitle?: string
  sessionLabel?: string
  sessionTracks?: SessionAudioTrack[]
  variant?: 'compact' | 'hero'
  className?: string
  interactive?: boolean
}

function EmbedCollectionPlayer({
  audioUrl,
  trackTitle,
  sessionLabel,
  tracks,
  variant,
  className,
  interactive,
}: {
  audioUrl: string
  trackTitle: string
  sessionLabel: string
  tracks: SessionAudioTrack[]
  variant: 'compact' | 'hero'
  className?: string
  interactive: boolean
}) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [queueOpen, setQueueOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => pickActiveTrackIndex(tracks, audioUrl, trackTitle))

  const parsed = parseExternalAudioLink(audioUrl)
  const activeTrack = tracks[activeIndex] ?? tracks[0]
  const activeEmbed = activeTrack ? trackPlaybackUrl(activeTrack) : parsed.embedUrl

  useEffect(() => {
    setActiveIndex(pickActiveTrackIndex(tracks, audioUrl, trackTitle))
  }, [audioUrl, trackTitle, tracks.map((track) => track.id).join('|')])

  useEffect(() => {
    if (!queueOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setQueueOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setQueueOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [queueOpen])

  const selectTrack = useCallback((index: number) => {
    setActiveIndex(index)
    setQueueOpen(false)
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn(
        'explore-article-audio article-session-audio__embed-player',
        variant === 'compact' && 'explore-article-audio--compact',
        queueOpen && 'explore-article-audio--queue-open',
        className,
      )}
    >
      <div className="explore-article-audio__head">
        <AudioLines size={14} strokeWidth={2} aria-hidden className="explore-article-audio__head-icon" />
        <span>{sessionLabel}</span>
      </div>

      <div className="explore-article-audio__controls">
        <button type="button" className="explore-article-audio__play" disabled aria-hidden>
          <Play size={variant === 'compact' ? 14 : 18} fill="currentColor" className="explore-article-audio__icon" />
        </button>

        <div className="explore-article-audio__track">
          <p className="explore-article-audio__title">{activeTrack?.title ?? trackTitle}</p>
          <p className="explore-article-audio__time">
            {tracks.length > 1 ? `${tracks.length} tracks` : parsed.providerLabel}
          </p>
        </div>

        <button
          type="button"
          className={cn('explore-article-audio__queue', queueOpen && 'is-open')}
          aria-label="Album track list"
          aria-expanded={queueOpen ? 'true' : 'false'}
          aria-controls={panelId}
          disabled={tracks.length === 0}
          onClick={() => setQueueOpen((open) => !open)}
        >
          <ListMusic size={16} strokeWidth={1.75} aria-hidden className="explore-article-audio__icon" />
        </button>
      </div>

      {queueOpen && tracks.length > 0 ? (
        <div id={panelId} className="explore-article-audio__panel" role="region" aria-label="Album tracks">
          <p className="explore-article-audio__panel-head">
            {tracks.length} track{tracks.length === 1 ? '' : 's'}
          </p>
          <ul className="explore-article-audio__panel-list">
            {tracks.map((track, index) => (
              <li key={track.id}>
                <button
                  type="button"
                  className={cn('explore-article-audio__panel-item', index === activeIndex && 'is-active')}
                  onClick={() => selectTrack(index)}
                >
                  <span className="explore-article-audio__panel-copy">
                    <span className="explore-article-audio__panel-title">{track.title}</span>
                    <span className="explore-article-audio__panel-artist">{track.artistName}</span>
                  </span>
                  <span className="explore-article-audio__panel-duration">{formatTime(track.durationSec)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="article-session-audio__embed-frame">
        {activeEmbed ? (
          <iframe
            src={activeEmbed}
            title={`${activeTrack?.title ?? trackTitle} player`}
            allow="autoplay; encrypted-media; fullscreen"
            loading="lazy"
            className={cn('article-session-audio__iframe', !interactive && 'pointer-events-none')}
          />
        ) : null}
      </div>

      {interactive && parsed.openUrl ? (
        <a
          href={parsed.openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="article-session-audio__embed-link"
        >
          <ExternalLink className="h-3 w-3" />
          Open on {parsed.providerLabel}
        </a>
      ) : null}
    </div>
  )
}

export function ArticleSessionAudioPlayer({
  audioUrl,
  trackTitle = 'Session',
  sessionLabel = 'Listen to the session',
  sessionTracks,
  variant = 'compact',
  className,
  interactive = true,
}: ArticleSessionAudioPlayerProps) {
  const parsed = parseExternalAudioLink(audioUrl)
  const { tracks, loading } = useSessionAudioTracks({
    audioUrl,
    trackTitle,
    sessionTracks,
  })

  const playableTracks = useMemo(
    () => tracks.filter((track) => isDirectPlayable(track.streamUrl)),
    [tracks],
  )

  if (!parsed.valid) {
    return (
      <div className={cn('article-session-audio__empty', className)}>
        Paste a valid audio link
      </div>
    )
  }

  if (playableTracks.length > 0) {
    const activeIndex = pickActiveTrackIndex(playableTracks, audioUrl, trackTitle)
    return (
      <ArticleAudioWidget
        title={playableTracks[activeIndex]?.title ?? trackTitle}
        streamUrl={playableTracks[activeIndex]?.streamUrl ?? playableTracks[0]?.streamUrl}
        tracks={playableTracks}
        sessionLabel={sessionLabel}
        variant={variant}
        className={className}
        isLoading={loading && playableTracks.length === 0}
      />
    )
  }

  if (parsed.streamUrl && parsed.provider === 'direct') {
    return (
      <ArticleAudioWidget
        title={trackTitle}
        streamUrl={parsed.streamUrl}
        sessionLabel={sessionLabel}
        variant={variant}
        className={className}
      />
    )
  }

  if (parsed.embedUrl || tracks.length > 0) {
    const collectionTracks =
      tracks.length > 0
        ? tracks
        : [
            {
              id: parsed.normalizedUrl,
              title: trackTitle,
              artistName: parsed.providerLabel,
              durationSec: 0,
              streamUrl: parsed.openUrl,
            },
          ]

    return (
      <EmbedCollectionPlayer
        audioUrl={audioUrl}
        trackTitle={trackTitle}
        sessionLabel={sessionLabel}
        tracks={collectionTracks}
        variant={variant}
        className={className}
        interactive={interactive}
      />
    )
  }

  return (
    <div className={cn('article-session-audio__embed', className)}>
      <div className="article-session-audio__embed-head">
        <span>{sessionLabel}</span>
        <span className="article-session-audio__embed-provider">{parsed.providerLabel}</span>
      </div>
      <p className="article-session-audio__embed-title">{trackTitle}</p>
      <audio
        controls={interactive}
        src={parsed.streamUrl ?? parsed.normalizedUrl}
        className={cn('article-session-audio__native', !interactive && 'pointer-events-none')}
        preload="metadata"
      />
    </div>
  )
}
