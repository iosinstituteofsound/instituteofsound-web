import { useAuthStore } from '@/app/stores/auth-store'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { AuthGuard } from '@/app/guards'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { PublicLayout } from '@/app/layouts/public-layout'

export function ExploreLayoutRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasSession = tokenStorage.hasSession()

  if (isAuthenticated || hasSession) {
    return (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    )
  }

  return <PublicLayout />
}
