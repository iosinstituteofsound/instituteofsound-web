import type { AcademyLessonVideo as AcademyLessonVideoData } from '@/lib/academy/types'

interface AcademyLessonVideoProps {
  video: AcademyLessonVideoData
}

export function AcademyLessonVideo({ video }: AcademyLessonVideoProps) {
  return (
    <section className="academy-lesson-video">
      <h2 className="academy-lesson-video-title">{video.title}</h2>
      <div className="academy-lesson-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  )
}
