import { Button } from '@/components/ui/Button'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { Role } from '@/services/api/authz.service'

interface RoleListPanelProps {
  roles: Role[]
  selectedRoleId?: string
  onSelect: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleListPanel({ roles, selectedRoleId, onSelect, onDelete }: RoleListPanelProps) {
  return (
    <div className="ios-panel p-4 space-y-4">
      <h3 className="font-display font-bold uppercase">Roles</h3>
      <ul className="space-y-2">
        {roles.map((role) => (
          <li key={role.id} className="flex items-center justify-between gap-2">
            <button
              type="button"
              className={`text-left flex-1 ${selectedRoleId === role.id ? 'text-mh-red' : ''}`}
              onClick={() => onSelect(role)}
            >
              <strong>{role.name}</strong>
              <span className="block text-xs text-muted">{role.slug}</span>
            </button>
            {role.is_system ? (
              <MetalBadge>System</MetalBadge>
            ) : (
              <Button type="button" variant="ghost" onClick={() => onDelete(role)}>
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
