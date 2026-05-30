import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import { EMPTY_ACADEMY_PROGRESS } from '@/lib/academy/typesProgress'
import type { EarLabMode } from '@/lib/academy/earLab'
import { readLocalSnapshot, writeLocalSnapshot } from '@/lib/academy/progressStore'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetAcademyProgress, v1PutAcademyProgress } from '@/api/v1Phase5Client'

interface AcademyProgressRow {
  user_id: string
  completed_lessons: string[]
  quiz_scores: Record<string, number>
  ear_lab: Partial<Record<EarLabMode, number>>
  certificate_name: string | null
}

let syncTimer: ReturnType<typeof setTimeout> | null = null
let pendingUserId: string | null = null

function rowToSnapshot(row: AcademyProgressRow): AcademyProgressSnapshot {
  return {
    completedLessons: Array.isArray(row.completed_lessons) ? row.completed_lessons : [],
    quizScores:
      row.quiz_scores && typeof row.quiz_scores === 'object' ? row.quiz_scores : {},
    earLab: row.ear_lab && typeof row.ear_lab === 'object' ? row.ear_lab : {},
    certificateName: row.certificate_name?.trim() ?? '',
  }
}

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
  userId: string
): Promise<AcademyProgressSnapshot | null> {
  if (!isSupabaseConfigured()) return null
  return viaV1Api(
    async () => {
      const { progress } = await v1GetAcademyProgress()
      return progress
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('academy_progress')
        .select('user_id, completed_lessons, quiz_scores, ear_lab, certificate_name')
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) return null
      return rowToSnapshot(data as AcademyProgressRow)
    },
  )
}

export async function pushCloudAcademyProgress(
  userId: string,
  snapshot: AcademyProgressSnapshot
): Promise<void> {
  if (!isSupabaseConfigured()) return
  await viaV1Api(
    () => v1PutAcademyProgress(snapshot),
    async () => {
      const supabase = getSupabase()
      const { error } = await supabase.from('academy_progress').upsert(
        {
          user_id: userId,
          completed_lessons: snapshot.completedLessons,
          quiz_scores: snapshot.quizScores,
          ear_lab: snapshot.earLab,
          certificate_name: snapshot.certificateName.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      if (error) console.warn('[academy] cloud sync failed:', error.message)
    },
  )
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
