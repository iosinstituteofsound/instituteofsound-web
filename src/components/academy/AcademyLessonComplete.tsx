import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  isLessonComplete,
  subscribeProgressChange,
  toggleLessonComplete,
} from '@/lib/academy/progress'

export function AcademyLessonComplete({ lessonId }: { lessonId: string }) {
  const [done, setDone] = useState(() => isLessonComplete(lessonId))

  useEffect(() => {
    return subscribeProgressChange(() => setDone(isLessonComplete(lessonId)))
  }, [lessonId])

  return (
    <button
      type="button"
      className={clsx('academy-complete-btn', done && 'academy-complete-btn-on')}
      onClick={() => setDone(toggleLessonComplete(lessonId))}
    >
      {done ? '✓ Lesson complete' : 'Mark lesson complete'}
    </button>
  )
}
