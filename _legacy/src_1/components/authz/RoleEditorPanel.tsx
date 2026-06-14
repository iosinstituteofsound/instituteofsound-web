import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Permission, Role } from '@/services/api/authz.service'
import { PermissionPicker } from './PermissionPicker'

interface RoleEditorPanelProps {
  selectedRole: Role | null
  permissions: Permission[]
  selectedPerms: Set<string>
  newRoleName: string
  onNewRoleNameChange: (value: string) => void
  onCreateRole: () => void
  onTogglePerm: (slug: string) => void
  onSave: () => void
}

export function RoleEditorPanel({
  selectedRole,
  permissions,
  selectedPerms,
  newRoleName,
  onNewRoleNameChange,
  onCreateRole,
  onTogglePerm,
  onSave,
}: RoleEditorPanelProps) {
  return (
    <div className="space-y-4">
      <div className="ios-panel p-4 space-y-4">
        <h3 className="font-display font-bold uppercase">Create role</h3>
        <div className="flex gap-2">
          <Input
            value={newRoleName}
            onChange={(e) => onNewRoleNameChange(e.target.value)}
            placeholder="New role name"
          />
          <Button type="button" onClick={onCreateRole}>
            Create
          </Button>
        </div>
      </div>

      <div className="ios-panel p-4 space-y-4">
        <h3 className="font-display font-bold uppercase">
          {selectedRole ? `Permissions — ${selectedRole.name}` : 'Select a role'}
        </h3>
        {selectedRole && !selectedRole.is_system && (
          <>
            <PermissionPicker
              permissions={permissions}
              selected={selectedPerms}
              onToggle={onTogglePerm}
            />
            <Button type="button" onClick={onSave}>
              Save permissions
            </Button>
          </>
        )}
        {selectedRole?.is_system && (
          <p className="text-sm text-muted">System role — full access via engine shortcut.</p>
        )}
      </div>
    </div>
  )
}
