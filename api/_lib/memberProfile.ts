import type { DashboardPersona, User, UserRole } from '../../src/lib/auth/types.js'

type MemberProfileRow = {
  id: string
  email: string
  name: string
  role: UserRole
  dashboard_persona?: DashboardPersona | null
  avatar_url?: string | null
  username?: string | null
  bio?: string | null
  created_at: string
}

export function mapMemberProfile(row: MemberProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    dashboardPersona: row.dashboard_persona ?? undefined,
    avatarUrl: row.avatar_url?.trim() || undefined,
    username: row.username?.trim() || undefined,
    bio: row.bio?.trim() || undefined,
    createdAt: row.created_at,
  }
}
