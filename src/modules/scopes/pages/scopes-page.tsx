import type { ColumnDef } from '@tanstack/react-table'
import { useCatalog } from '@/modules/permissions/hooks/use-permissions'
import type { ScopeSummary } from '@/shared/types/auth.types'
import { DataTable } from '@/shared/components/data-table/data-table'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'

const columns: ColumnDef<ScopeSummary>[] = [
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'kind', header: 'Kind' },
  { accessorKey: 'permissionSlug', header: 'Permission' },
]

export function ScopesPage() {
  const { data, isLoading, isError, refetch } = useCatalog()
  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scopes</h1>
      <DataTable columns={columns} data={data?.scopes ?? []} />
    </div>
  )
}
