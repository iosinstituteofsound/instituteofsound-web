import type { ColumnDef } from '@tanstack/react-table'
import { groupPermissionsByCategory } from '@/modules/permissions/api/permission.api'
import { useAuditLogs, usePermissions } from '@/modules/permissions/hooks/use-permissions'
import { DataTable } from '@/shared/components/data-table/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Page, PageTitle } from '@/shared/components/layout/page-shell'

interface PermissionRow {
  slug: string
  name: string
  group: string
}

export function PermissionsPage() {
  const { data: permissions, isLoading, isError, refetch } = usePermissions()
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs()

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const grouped = permissions ? groupPermissionsByCategory(permissions) : []

  const rows: PermissionRow[] = grouped.flatMap((group) =>
    group.permissions.map((p) => ({ ...p, group: group.label })),
  )

  const columns: ColumnDef<PermissionRow>[] = [
    { accessorKey: 'group', header: 'Group' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'name', header: 'Name' },
  ]

  const auditColumns: ColumnDef<{ id: string; action: string; actorEmail?: string; createdAt: string }>[] = [
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'actorEmail', header: 'Actor' },
    { accessorKey: 'createdAt', header: 'Date' },
  ]

  return (
    <Page>
      <PageTitle>Permissions</PageTitle>
      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">Permission Catalog</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="permissions" className="space-y-4">
          {grouped.map((group) => (
            <Card key={group.slug}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {group.label}
                  <Badge variant="secondary">{group.permissions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {group.permissions.map((p) => (
                  <Badge key={p.slug} variant="outline">
                    {p.slug}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
          <DataTable columns={columns} data={rows} />
        </TabsContent>
        <TabsContent value="audit">
          {auditLoading ? (
            <PageLoader />
          ) : (
            <DataTable columns={auditColumns} data={auditLogs ?? []} />
          )}
        </TabsContent>
      </Tabs>
    </Page>
  )
}
