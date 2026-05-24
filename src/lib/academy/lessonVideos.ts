import type { AcademyLesson, AcademyLessonVideo } from '@/lib/academy/types'

export function getLessonVideos(lesson: AcademyLesson): AcademyLessonVideo[] {
  if (lesson.videos?.length) return lesson.videos
  if (lesson.video) return [lesson.video]
  return []
}
