import { Play } from 'lucide-react'
import type { MusicVideoDto } from '@/modules/explore/types/explore.types'
import {
  fillMusicVideosPreview,
  formatVideoDuration,
  formatVideoViews,
  isVideoPreviewRelease,
} from '@/modules/profile/lib/discography-format'
import '@/modules/profile/styles/disc-music-videos.css'

type DiscographyMusicVideosSectionProps = {
  videos: MusicVideoDto[]
}

export function DiscographyMusicVideosSection({ videos }: DiscographyMusicVideosSectionProps) {
  const items = fillMusicVideosPreview(videos)
  if (items.length === 0) return null

  return (
    <section className="disc-videos" aria-labelledby="discography-videos-heading">
      <header className="disc-videos__head profile-discography__section-head">
        <p className="disc-videos__kicker profile-discography__section-kicker ios-mh-kicker">
          :: Broadcast
        </p>
        <h2 id="discography-videos-heading" className="disc-videos__title profile-discography__section-title">
          Music videos
        </h2>
      </header>

      <div className="disc-videos__reel">
        {items.map((video, index) => {
          const preview = isVideoPreviewRelease(video.id)
          const monitor = (
            <>
              <span className="disc-videos__monitor-id" aria-hidden>
                MV-{String(index + 1).padStart(2, '0')}
              </span>

              <span className="disc-videos__screen">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="disc-videos__thumb" loading="lazy" />
                ) : (
                  <span className="disc-videos__thumb disc-videos__thumb--fallback" aria-hidden />
                )}
                <span className="disc-videos__screen-grid" aria-hidden />
                <span className="disc-videos__screen-scan" aria-hidden />
                <span className="disc-videos__corner disc-videos__corner--tl" aria-hidden />
                <span className="disc-videos__corner disc-videos__corner--tr" aria-hidden />
                <span className="disc-videos__corner disc-videos__corner--bl" aria-hidden />
                <span className="disc-videos__corner disc-videos__corner--br" aria-hidden />
                <span className="disc-videos__play" aria-hidden>
                  <Play size={22} strokeWidth={1.75} fill="currentColor" />
                </span>
                <span className="disc-videos__duration">{formatVideoDuration(video.durationSec)}</span>
              </span>
            </>
          )

          return (
            <article key={video.id} className={`disc-videos__unit${preview ? ' disc-videos__unit--preview' : ''}`}>
              {preview ? (
                <div className="disc-videos__monitor" aria-label={video.title}>
                  {monitor}
                </div>
              ) : (
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="disc-videos__monitor"
                  aria-label={`Watch ${video.title}`}
                >
                  {monitor}
                </a>
              )}

              <div className="disc-videos__meta">
                <h3 className="disc-videos__name">{video.title}</h3>
                <p className="disc-videos__stat">
                  <span className="disc-videos__stat-value">{formatVideoViews(video.viewCount)}</span>
                  <span className="disc-videos__stat-label">views</span>
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
