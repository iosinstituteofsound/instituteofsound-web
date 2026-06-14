import { useSyncExternalStore } from 'react'
import {
  getCompletedLessons,
  getEarLabScores,
  getCertificateName,
  getProgressSnapshot,
  getQuizScores,
  subscribeProgressChange,
} from '@/lib/academy/progress'

function subscribe(cb: () => void) {
  return subscribeProgressChange(cb)
}

function getSnapshot() {
  return getProgressSnapshot()
}

export function useAcademyProgress() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    snapshot,
    completedLessons: snapshot.completedLessons,
    quizScores: snapshot.quizScores,
    earLab: snapshot.earLab,
    certificateName: snapshot.certificateName,
    completedCount: snapshot.completedLessons.length,
    getCompletedLessons,
    getQuizScores,
    getEarLabScores,
    getCertificateName,
  }
}
