import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { recordTrackClick } from '@/lib/analytics/artistAnalytics'
import type { ArtistTrack } from '@/lib/artist-profile/types'
import { getStreamEmbed } from '@/lib/artist-profile/embed'
import {
  STREAM_PLATFORM_LABEL,
  streamPlatform,
} from '@/lib/artist-profile/streamPlatform'
import { CoverArt, formatPlayCount } from './CoverArt'
import { ArtistStreamEmbed } from './ArtistStreamEmbed'

interface TrackListWithPlayersProps {
  tracks: ArtistTrack[]
  profileId: string
  published: boolean
  viewerUserId?: string
  ownerUserId?: string
}

export function TrackListWithPlayers({
  tracks,
  profileId,
  published,
  viewerUserId,
  ownerUserId,
}: TrackListWithPlayersProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ol className="artist-site-track-list">
      {tracks.map((track, i) => {
        const platform = streamPlatform(track.streamUrl)
        const embed = getStreamEmbed(track.streamUrl, track.title)
        const index = i + 1
        const isOpen = openId === track.id

        const logClick = () => {
          void recordTrackClick(profileId, track.id, {
            viewerUserId,
            ownerUserId,
            published,
          })
        }

        const togglePlay = () => {
          if (embed) {
            if (!isOpen) logClick()
            setOpenId(isOpen ? null : track.id)
            return
          }
          logClick()
          window.open(track.streamUrl, '_blank', 'noopener,noreferrer')
        }

        return (
          <li
            key={track.id}
            className={clsx('artist-site-track-item', isOpen && 'artist-site-track-item-open')}
          >
            <div className="artist-site-track">
              <span className="artist-site-track-index">{String(index).padStart(2, '0')}</span>
              <CoverArt
                src={track.coverUrl}
                alt=""
                size="sm"
                className="artist-site-track-thumb"
              />
              <button
                type="button"
                className={clsx(
                  'artist-site-track-play-btn',
                  isOpen && 'artist-site-track-play-btn-active'
                )}
                onClick={togglePlay}
                aria-expanded={embed ? isOpen : undefined}
                aria-label={
                  embed
                    ? isOpen
                      ? `Close player for ${track.title}`
                      : `Play ${track.title}`
                    : `Open ${track.title} on ${STREAM_PLATFORM_LABEL[platform]}`
                }
              >
                <span className="artist-site-track-play-icon" aria-hidden>
                  {isOpen ? '✕' : '▶'}
                </span>
              </button>
              <span className="artist-site-track-main">
                <span className="artist-site-track-title">{track.title}</span>
                <span className="artist-site-track-platform">
                  {STREAM_PLATFORM_LABEL[platform]}
                </span>
              </span>
              <span className="artist-site-track-plays">{formatPlayCount(track.playCount)}</span>
              <a
                href={track.streamUrl}
                target="_blank"
                rel="noreferrer"
                className="artist-site-track-open"
                aria-label={`Open ${track.title} on ${STREAM_PLATFORM_LABEL[platform]}`}
                onClick={logClick}
              >
                Open ↗
              </a>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && embed && (
                <motion.div
                  key="player"
                  className="artist-site-track-player-slide"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="artist-site-track-embed-inner">
                    <ArtistStreamEmbed
                      streamUrl={track.streamUrl}
                      title={track.title}
                      variant="inline"
                      index={index}
                      className="artist-site-track-embed"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ol>
  )
}
