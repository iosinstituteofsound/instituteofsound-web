import type { ColumnDef } from '@tanstack/react-table'
import { useCatalog } from '@/modules/permissions/hooks/use-permissions'
import type { FeatureDto } from '@/modules/permissions/api/permission.api'
import { DataTable } from '@/shared/components/data-table/data-table'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'

const columns: ColumnDef<FeatureDto>[] = [
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  {
    accessorKey: 'scopeIds',
    header: 'Scopes',
    cell: ({ row }) => row.original.scopeIds.length,
  },
]

export function FeaturesPage() {
  const { data, isLoading, isError, refetch } = useCatalog()
  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Features</h1>
      <DataTable columns={columns} data={data?.features ?? []} />
    </div>
  )
}
