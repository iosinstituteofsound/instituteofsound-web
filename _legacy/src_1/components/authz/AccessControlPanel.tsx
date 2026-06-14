import { useCallback, useEffect, useState } from 'react'
import {
  assignUserRole,
  createPolicy,
  createRole,
  deleteRole,
  fetchAuditLogs,
  fetchPermissionCatalog,
  fetchPolicies,
  fetchRolePermissions,
  fetchRoles,
  fetchUserRoles,
  revokeUserRole,
  searchUsers,
  updateRole,
  type AccessPolicy,
  type Permission,
  type Role,
} from '@/services/api/authz.service'
import { RoleListPanel } from './RoleListPanel'
import { RoleEditorPanel } from './RoleEditorPanel'
import { UserRoleAssignmentPanel } from './UserRoleAssignmentPanel'
import { PolicyBuilderPanel } from './PolicyBuilderPanel'
import { ScopeConfigurator } from './ScopeConfigurator'
import { AuditLogPanel } from './AuditLogPanel'

type Tab = 'roles' | 'assignments' | 'policies' | 'scopes' | 'audit'

export function AccessControlPanel() {
  const [tab, setTab] = useState<Tab>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [policies, setPolicies] = useState<AccessPolicy[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [newRoleName, setNewRoleName] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState<
    { id: string; email: string; name: string; username?: string }[]
  >([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userRoleRows, setUserRoleRows] = useState<{ id: string; roles?: { id: string; name: string } }[]>([])
  const [auditLogs, setAuditLogs] = useState<
    { created_at: string; permission_slug: string; decision: string; reason: string }[]
  >([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [{ roles: r }, catalog, policyRes] = await Promise.all([
        fetchRoles(),
        fetchPermissionCatalog(),
        fetchPolicies(),
      ])
      setRoles(r)
      setPermissions(catalog.permissions)
      setPolicies(policyRes.policies)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load authz data')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (tab === 'audit') {
      void fetchAuditLogs().then((res) =>
        setAuditLogs(
          (res.logs ?? []) as {
            created_at: string
            permission_slug: string
            decision: string
            reason: string
          }[],
        ),
      )
    }
  }, [tab])

  const selectRole = async (role: Role) => {
    setSelectedRole(role)
    setMessage('')
    if (role.is_system) {
      setSelectedPerms(new Set())
      return
    }
    try {
      const res = await fetchRolePermissions(role.id)
      const slugs = new Set<string>()
      for (const row of res.permissions ?? []) {
        if (row.effect === 'allow' && row.permissions?.slug) slugs.add(row.permissions.slug)
      }
      setSelectedPerms(slugs)
    } catch {
      setSelectedPerms(new Set())
    }
  }

  const togglePerm = (slug: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const saveRolePermissions = async () => {
    if (!selectedRole || selectedRole.is_system) return
    setError('')
    try {
      await updateRole(selectedRole.id, { permissionSlugs: [...selectedPerms] })
      setMessage(`Saved permissions for ${selectedRole.name}`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return
    setError('')
    try {
      await createRole({ name: newRoleName.trim() })
      setNewRoleName('')
      setMessage('Role created')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    }
  }

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) return
    if (!window.confirm(`Delete role "${role.name}"?`)) return
    try {
      await deleteRole(role.id)
      if (selectedRole?.id === role.id) setSelectedRole(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const searchForUsers = async () => {
    if (userQuery.trim().length < 2) return
    const res = await searchUsers(userQuery.trim())
    setUserResults(res.users)
  }

  const loadUserRoles = async (userId: string) => {
    setSelectedUserId(userId)
    const res = await fetchUserRoles(userId)
    setUserRoleRows((res.roles ?? []) as { id: string; roles?: { id: string; name: string } }[])
  }

  const assignRole = async (roleId: string) => {
    if (!selectedUserId) return
    await assignUserRole(selectedUserId, roleId)
    await loadUserRoles(selectedUserId)
    setMessage('Role assigned')
  }

  const unassignRole = async (roleId: string) => {
    if (!selectedUserId) return
    await revokeUserRole(selectedUserId, roleId)
    await loadUserRoles(selectedUserId)
    setMessage('Role revoked')
  }

  const handleCreatePolicy = async (input: {
    name: string
    permissionSlug: string
    roleSlug: string
    effect: 'allow' | 'deny'
  }) => {
    try {
      await createPolicy({
        name: input.name,
        permission_slug: input.permissionSlug,
        role_slug: input.roleSlug || undefined,
        effect: input.effect,
        is_active: true,
        priority: 100,
        conditions: [],
      })
      setMessage('Policy created')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Policy create failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['roles', 'assignments', 'policies', 'scopes', 'audit'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
              tab === t ? 'border-mh-red text-mh-red' : 'border-border text-muted'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-green-400">{message}</p>}
      {error && <p className="text-sm text-mh-red">{error}</p>}

      {tab === 'roles' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <RoleListPanel
            roles={roles}
            selectedRoleId={selectedRole?.id}
            onSelect={(role) => void selectRole(role)}
            onDelete={(role) => void handleDeleteRole(role)}
          />
          <RoleEditorPanel
            selectedRole={selectedRole}
            permissions={permissions}
            selectedPerms={selectedPerms}
            newRoleName={newRoleName}
            onNewRoleNameChange={setNewRoleName}
            onCreateRole={() => void handleCreateRole()}
            onTogglePerm={togglePerm}
            onSave={() => void saveRolePermissions()}
          />
        </div>
      )}

      {tab === 'assignments' && (
        <UserRoleAssignmentPanel
          roles={roles}
          userQuery={userQuery}
          userResults={userResults}
          selectedUserId={selectedUserId}
          userRoleRows={userRoleRows}
          onQueryChange={setUserQuery}
          onSearch={() => void searchForUsers()}
          onSelectUser={(id) => void loadUserRoles(id)}
          onAssign={(id) => void assignRole(id)}
          onRevoke={(id) => void unassignRole(id)}
        />
      )}

      {tab === 'policies' && (
        <PolicyBuilderPanel policies={policies} onCreate={(input) => void handleCreatePolicy(input)} />
      )}

      {tab === 'scopes' && <ScopeConfigurator />}

      {tab === 'audit' && <AuditLogPanel logs={auditLogs} />}
    </div>
  )
}
