import { FieldLabel, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Role } from '@/services/api/authz.service'

interface UserRoleAssignmentPanelProps {
  roles: Role[]
  userQuery: string
  userResults: { id: string; email: string; name: string; username?: string }[]
  selectedUserId: string
  userRoleRows: { id: string; roles?: { id: string; name: string } }[]
  onQueryChange: (value: string) => void
  onSearch: () => void
  onSelectUser: (userId: string) => void
  onAssign: (roleId: string) => void
  onRevoke: (roleId: string) => void
}

export function UserRoleAssignmentPanel({
  roles,
  userQuery,
  userResults,
  selectedUserId,
  userRoleRows,
  onQueryChange,
  onSearch,
  onSelectUser,
  onAssign,
  onRevoke,
}: UserRoleAssignmentPanelProps) {
  return (
    <div className="ios-panel p-4 space-y-4 max-w-2xl">
      <h3 className="font-display font-bold uppercase">User role assignments</h3>
      <div className="flex gap-2">
        <Input
          value={userQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by email or name"
        />
        <Button type="button" onClick={onSearch}>
          Search
        </Button>
      </div>
      <ul className="space-y-1">
        {userResults.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              className={`text-sm w-full text-left py-1 hover:text-mh-red ${
                selectedUserId === u.id ? 'text-mh-red' : ''
              }`}
              onClick={() => onSelectUser(u.id)}
            >
              {u.name} · {u.email}
            </button>
          </li>
        ))}
      </ul>
      {selectedUserId && (
        <>
          <FieldLabel>Assign role</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <Button key={r.id} type="button" variant="secondary" onClick={() => onAssign(r.id)}>
                + {r.name}
              </Button>
            ))}
          </div>
          <FieldLabel>Current roles</FieldLabel>
          <ul className="text-sm space-y-1">
            {userRoleRows.map((row) => (
              <li key={row.id} className="flex justify-between items-center">
                <span>{row.roles?.name ?? 'Role'}</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRevoke(row.roles?.id ?? '')}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
