import type { AcademyLessonVideo as AcademyLessonVideoData } from '@/lib/academy/types'

interface AcademyLessonVideoProps {
  video: AcademyLessonVideoData
}

function youtubeEmbedSrc(video: AcademyLessonVideoData): string {
  if (video.playlistId) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${video.playlistId}`
  }
  return `https://www.youtube-nocookie.com/embed/${video.youtubeId ?? ''}`
}

export function AcademyLessonVideo({ video }: AcademyLessonVideoProps) {
  if (!video.youtubeId && !video.playlistId && !video.href) return null

  if (video.href) {
    return (
      <section className="academy-lesson-video academy-lesson-resource">
        <h2 className="academy-lesson-video-title">{video.title}</h2>
        <a
          href={video.href}
          target="_blank"
          rel="noopener noreferrer"
          className="academy-lesson-resource-link"
        >
          Open resource →
        </a>
      </section>
    )
  }

  return (
    <section className="academy-lesson-video">
      <h2 className="academy-lesson-video-title">{video.title}</h2>
      <div className="academy-lesson-video-frame">
        <iframe
          src={youtubeEmbedSrc(video)}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  )
}
