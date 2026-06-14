import {
  LayoutGrid,
  Layers,
  Pencil,
  Shield,
  Trash2,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RoleDto } from '@/modules/roles/api/role.api'
import type { AssignmentOption } from '@/modules/roles/components/assignment-picker'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/cn'

interface RoleCardProps {
  role: RoleDto
  layoutName?: string
  layoutNavCount?: number
  featureLabels: string[]
  scopeLabels: string[]
  resourceLabels: string[]
  onEdit: () => void
  onDelete: () => void
}

function AssignmentSection({
  icon: Icon,
  title,
  description,
  labels,
  emptyText,
}: {
  icon: typeof Shield
  title: string
  description: string
  labels: string[]
  emptyText: string
}) {
  const preview = labels.slice(0, 4)
  const remaining = labels.length - preview.length

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Badge variant="secondary">{labels.length}</Badge>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{description}</p>
      {labels.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {preview.map((label) => (
            <Badge key={label} variant="outline" className="max-w-full truncate font-normal">
              {label}
            </Badge>
          ))}
          {remaining > 0 && (
            <Badge variant="outline" className="font-normal">
              +{remaining} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export function RoleCard({
  role,
  layoutName,
  layoutNavCount = 0,
  featureLabels,
  scopeLabels,
  resourceLabels,
  onEdit,
  onDelete,
}: RoleCardProps) {
  const totalAssignments =
    role.featureIds.length + role.extraScopeIds.length + role.extraResourceIds.length

  return (
    <Card className={cn('flex flex-col', role.isSystem && 'border-primary/30')}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">{role.name}</CardTitle>
            <CardDescription className="font-mono text-xs">{role.slug}</CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {role.isSystem && <Badge>System</Badge>}
            <Badge variant="outline">{totalAssignments} total</Badge>
          </div>
        </div>
        {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
        {layoutName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="h-4 w-4" />
            <span>
              Layout:{' '}
              <Link to="/layouts" className="text-foreground underline-offset-4 hover:underline">
                {layoutName}
              </Link>
              {layoutNavCount > 0 ? ` · ${layoutNavCount} nav items` : null}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="grid flex-1 gap-3 sm:grid-cols-2">
        <AssignmentSection
          icon={Zap}
          title="Features"
          description="Permission bundles grouped for this role"
          labels={featureLabels}
          emptyText="No features assigned"
        />
        <AssignmentSection
          icon={Shield}
          title="Scopes"
          description="API permissions like users.view, roles.edit"
          labels={scopeLabels}
          emptyText="No scopes assigned"
        />
        <AssignmentSection
          icon={Layers}
          title="Resources"
          description="Pages and components the role can open"
          labels={resourceLabels}
          emptyText="No resources assigned"
        />
      </CardContent>

      <CardFooter className="gap-2 border-t bg-muted/20 pt-4">
        <PermissionGate resource="roles" action="update">
          <Button variant="default" size="sm" className="gap-2" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Manage access
          </Button>
        </PermissionGate>
        {!role.isSystem && (
          <PermissionGate resource="roles" action="delete">
            <Button variant="outline" size="sm" className="gap-2" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </PermissionGate>
        )}
      </CardFooter>
    </Card>
  )
}

export function resolveAssignmentLabels(ids: string[], options: AssignmentOption[]): string[] {
  return ids
    .map((id) => options.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label))
}
