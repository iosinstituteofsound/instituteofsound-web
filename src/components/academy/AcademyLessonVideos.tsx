import { AcademyLessonVideo } from '@/components/academy/AcademyLessonVideo'
import { getLessonVideos } from '@/lib/academy/lessonVideos'
import type { AcademyLesson } from '@/lib/academy/types'

interface AcademyLessonVideosProps {
  lesson: AcademyLesson
}

export function AcademyLessonVideos({ lesson }: AcademyLessonVideosProps) {
  const videos = getLessonVideos(lesson)
  if (videos.length === 0) return null

  return (
    <section className="academy-lesson-videos" aria-label="Lesson videos">
      {videos.length > 1 && (
        <h2 className="academy-lesson-videos-heading">Video lessons ({videos.length})</h2>
      )}
      {videos.map((video, index) => (
        <AcademyLessonVideo
          key={video.youtubeId ?? video.playlistId ?? video.href ?? index}
          video={video}
        />
      ))}
    </section>
  )
}
