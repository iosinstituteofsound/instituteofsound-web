import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { UserDetailDialog } from '@/modules/users/components/user-detail-dialog'
import { useUsers } from '@/modules/users/hooks/use-users'
import type { UserSearchResult } from '@/modules/users/api/user.api'
import { DataTable } from '@/shared/components/data-table/data-table'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'
import { Page, PageTitle } from '@/shared/components/layout/page-shell'

export function UsersListPage() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
  const { data, isLoading, isError, refetch } = useUsers(search)

  const columns = useMemo<ColumnDef<UserSearchResult>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setSelectedUser(row.original)}
          >
            {row.original.name}
          </button>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'username', header: 'Username' },
      {
        accessorKey: 'roles',
        header: 'Roles',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.length ? (
              row.original.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  const handleSearch = () => {
    const trimmed = query.trim()
    if (trimmed.length >= 2 || trimmed.length === 0) {
      setSearch(trimmed)
    }
  }

  return (
    <Page>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Users' }]} />
      <PageTitle>Users</PageTitle>
      <div className="flex gap-2">
        <Input
          placeholder="Search by name, email, or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>Search</Button>
        {search ? (
          <Button variant="outline" onClick={() => { setQuery(''); setSearch('') }}>
            Clear
          </Button>
        ) : null}
      </div>
      {query.trim().length === 1 ? (
        <p className="text-sm text-muted-foreground">Enter at least 2 characters to filter users.</p>
      ) : isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable columns={columns} data={data ?? []} searchKey="name" searchPlaceholder="Filter table..." />
      )}

      <UserDetailDialog
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name}
        open={Boolean(selectedUser)}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null)
        }}
      />
    </Page>
  )
}
