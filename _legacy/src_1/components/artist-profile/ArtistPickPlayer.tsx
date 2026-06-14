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
import { CoverArt } from './CoverArt'
import { ArtistStreamEmbed } from './ArtistStreamEmbed'

interface ArtistPickPlayerProps {
  profileName: string
  track: ArtistTrack
  profileId: string
  published: boolean
  viewerUserId?: string
  ownerUserId?: string
}

export function ArtistPickPlayer({
  profileName,
  track,
  profileId,
  published,
  viewerUserId,
  ownerUserId,
}: ArtistPickPlayerProps) {
  const [open, setOpen] = useState(false)
  const embed = getStreamEmbed(track.streamUrl, track.title)
  const platform = streamPlatform(track.streamUrl)

  const logClick = () => {
    void recordTrackClick(profileId, track.id, {
      viewerUserId,
      ownerUserId,
      published,
    })
  }

  const toggle = () => {
    if (embed) {
      if (!open) logClick()
      setOpen((v) => !v)
    } else {
      logClick()
      window.open(track.streamUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={clsx('artist-site-pick', open && 'artist-site-pick-open')}>
      <p className="artist-site-eyebrow">Artist pick</p>
      <p className="artist-site-pick-by">Curated by {profileName}</p>

      <button
        type="button"
        className="artist-site-pick-visual-btn group w-full text-left"
        onClick={toggle}
        aria-expanded={embed ? open : undefined}
        aria-label={embed ? `Play ${track.title}` : `Open ${track.title}`}
      >
        <div className="artist-site-pick-visual relative">
          <CoverArt src={track.coverUrl} alt={track.title} size="pick" />
          <span
            className={clsx(
              'artist-site-pick-play-fab',
              open && 'artist-site-pick-play-fab-active'
            )}
            aria-hidden
          >
            {open ? '✕' : '▶'}
          </span>
        </div>
        <h3 className="artist-site-pick-title">{track.title}</h3>
      </button>

      <AnimatePresence initial={false}>
        {open && embed && (
          <motion.div
            className="artist-site-pick-player-slide"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ArtistStreamEmbed
              streamUrl={track.streamUrl}
              title={track.title}
              variant="inline"
              className="artist-site-pick-embed"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={track.streamUrl}
        target="_blank"
        rel="noreferrer"
        className="artist-site-pick-cta inline-block mt-3"
        onClick={logClick}
      >
        Open on {STREAM_PLATFORM_LABEL[platform]} ↗
      </a>
    </div>
  )
}
