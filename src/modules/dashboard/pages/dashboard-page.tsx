import { useMe } from '@/modules/auth/hooks/use-auth'
import { usePermission } from '@/shared/hooks/use-permission'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Page, PageDescription, PageHeader, PageHeaderMain, PageTitle } from '@/shared/components/layout/page-shell'

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useMe()
  const { isSuperAdmin } = usePermission()

  if (isLoading) return <PageLoader />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const { user, authorization } = data

  return (
    <Page>
      <PageHeader>
        <PageHeaderMain>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>Welcome back, {user.name}</PageDescription>
        </PageHeaderMain>
      </PageHeader>

      <div className="ios-page-grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="ios-surface-eyebrow">Roles</p>
            <CardTitle className="sr-only">Roles</CardTitle>
            <CardDescription>Assigned roles</CardDescription>
          </CardHeader>
          <CardContent className="ios-surface-stat">{authorization.roles.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="ios-surface-eyebrow">Permissions</p>
            <CardTitle className="sr-only">Permissions</CardTitle>
            <CardDescription>Effective permissions</CardDescription>
          </CardHeader>
          <CardContent className="ios-surface-stat">{authorization.permissions.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="ios-surface-eyebrow">Access Level</p>
            <CardTitle className="sr-only">Access Level</CardTitle>
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
    </Page>
  )
}
