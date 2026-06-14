import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import { EMPTY_ACADEMY_PROGRESS } from '@/lib/academy/typesProgress'
import type { EarLabMode } from '@/lib/academy/earLab'
import { readLocalSnapshot, writeLocalSnapshot } from '@/lib/academy/progressStore'
import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetAcademyProgress, v1PutAcademyProgress } from '@/api/v1Phase5Client'

let syncTimer: ReturnType<typeof setTimeout> | null = null
let pendingUserId: string | null = null

export function mergeProgressSnapshots(
  local: AcademyProgressSnapshot,
  remote: AcademyProgressSnapshot
): AcademyProgressSnapshot {
  const lessons = [...new Set([...local.completedLessons, ...remote.completedLessons])]
  const quizScores = { ...local.quizScores }
  for (const [id, score] of Object.entries(remote.quizScores)) {
    const prev = quizScores[id]
    if (prev === undefined || score > prev) quizScores[id] = score
  }
  const earLab: Partial<Record<EarLabMode, number>> = { ...local.earLab }
  for (const mode of ['frequency', 'level', 'compression'] as EarLabMode[]) {
    const a = local.earLab[mode] ?? 0
    const b = remote.earLab[mode] ?? 0
    earLab[mode] = Math.max(a, b)
  }
  const certificateName =
    remote.certificateName.trim() || local.certificateName.trim()

  return { completedLessons: lessons, quizScores, earLab, certificateName }
}

export async function fetchCloudAcademyProgress(
  _userId: string
): Promise<AcademyProgressSnapshot | null> {
  if (!isSupabaseConfigured()) return null
  const { progress } = await v1GetAcademyProgress()
  return progress
}

export async function pushCloudAcademyProgress(
  _userId: string,
  snapshot: AcademyProgressSnapshot
): Promise<void> {
  if (!isSupabaseConfigured()) return
  await v1PutAcademyProgress(snapshot)
}

export function scheduleCloudSync(userId: string, snapshot: AcademyProgressSnapshot): void {
  if (!isSupabaseConfigured()) return
  pendingUserId = userId
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const id = pendingUserId
    pendingUserId = null
    if (id) void pushCloudAcademyProgress(id, snapshot)
  }, 600)
}

export async function pullAndMergeAcademyProgress(
  userId: string,
  defaultName?: string
): Promise<AcademyProgressSnapshot> {
  const local = readLocalSnapshot()
  const remote = (await fetchCloudAcademyProgress(userId)) ?? EMPTY_ACADEMY_PROGRESS

  let merged = mergeProgressSnapshots(local, remote)
  if (!merged.certificateName.trim() && defaultName?.trim()) {
    merged = { ...merged, certificateName: defaultName.trim() }
  }

  writeLocalSnapshot(merged)
  void pushCloudAcademyProgress(userId, merged)
  return merged
}
