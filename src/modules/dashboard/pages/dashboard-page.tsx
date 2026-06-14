import { useMe } from '@/modules/auth/hooks/use-auth'
import { usePermission } from '@/shared/hooks/use-permission'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useMe()
  const { isSuperAdmin } = usePermission()

  if (isLoading) return <PageLoader />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const { user, authorization } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Assigned roles</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{authorization.roles.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Effective permissions</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{authorization.permissions.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Access Level</CardTitle>
            <CardDescription>Your access tier</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuperAdmin ? (
              <Badge>Super Admin</Badge>
            ) : (
              <Badge variant="secondary">Standard</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Roles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {authorization.roles.map((role) => (
            <Badge key={role.slug} variant="outline">
              {role.name}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
