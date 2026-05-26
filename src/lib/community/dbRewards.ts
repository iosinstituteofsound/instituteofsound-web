/** dB awarded once per source (unique user_id + source + source_id). */
export const DB_REWARDS = {
  lesson_complete: 25,
  quiz_pass: 20,
  ear_lab_pass: 50,
  spin_post: 10,
  drop_post: 5,
} as const

export type DbSource = keyof typeof DB_REWARDS

export function earLabDbAmount(scaledScore: number): number {
  if (scaledScore < 7) return 0
  return DB_REWARDS.ear_lab_pass
}
