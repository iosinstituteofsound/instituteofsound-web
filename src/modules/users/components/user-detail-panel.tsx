import { useState } from 'react'
import { ExternalLink, Mail, UserRound } from 'lucide-react'
import { useAssignUserRole, useRevokeUserRole, useUser } from '@/modules/users/hooks/use-users'
import { useRoles } from '@/modules/roles/hooks/use-roles'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { toast } from '@/shared/components/ui/sonner'

interface UserDetailPanelProps {
  userId: string
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}

export function UserDetailPanel({ userId }: UserDetailPanelProps) {
  const [selectedRole, setSelectedRole] = useState('')
  const { data: user, isLoading, isError, refetch } = useUser(userId)
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const assignRole = useAssignUserRole(userId)
  const revokeRole = useRevokeUserRole(userId)

  const handleAssign = async () => {
    if (!selectedRole) return
    try {
      await assignRole.mutateAsync(selectedRole)
      toast.success('Role assigned')
      setSelectedRole('')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed'
      toast.error(message)
    }
  }

  if (isLoading || rolesLoading) return <PageLoader />
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="ios-page">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={getUserAvatarThumbnailUrl(user)} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-xl font-semibold">{user.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.username ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="h-4 w-4 shrink-0" />
              <span>@{user.username}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Organization" value={user.orgLabel} />
        <DetailField
          label="Joined"
          value={new Date(user.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        />
        <DetailField label="Dashboard persona" value={user.dashboardPersona?.replace(/_/g, ' ')} />
        {user.linkUrl ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Link</p>
            <a
              href={user.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {user.linkUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </div>

      {user.bio ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</p>
          <p className="mt-1 text-sm leading-relaxed">{user.bio}</p>
        </div>
      ) : null}

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Assigned Roles</h3>
          <p className="text-xs text-muted-foreground">Roles control what this user can access.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {user.roles.length ? (
            user.roles.map((role) => (
              <div key={role.roleId} className="flex items-center gap-2">
                <Badge variant="outline">{role.roleName}</Badge>
                <PermissionGate resource="roles" action="manage">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeRole.mutate(role.roleId)}
                    disabled={revokeRole.isPending}
                  >
                    Revoke
                  </Button>
                </PermissionGate>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No roles assigned.</p>
          )}
        </div>

        <PermissionGate resource="roles" action="manage">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={!selectedRole || assignRole.isPending}>
              Assign Role
            </Button>
          </div>
        </PermissionGate>
      </div>
    </div>
  )
}
