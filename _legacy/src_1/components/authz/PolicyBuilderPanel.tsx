import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input } from '@/components/ui/Input'
import type { AccessPolicy } from '@/services/api/authz.service'

interface PolicyBuilderPanelProps {
  policies: AccessPolicy[]
  onCreate: (input: {
    name: string
    permissionSlug: string
    roleSlug: string
    effect: 'allow' | 'deny'
  }) => void
}

export function PolicyBuilderPanel({ policies, onCreate }: PolicyBuilderPanelProps) {
  const [name, setName] = useState('')
  const [permissionSlug, setPermissionSlug] = useState('')
  const [roleSlug, setRoleSlug] = useState('')
  const [effect, setEffect] = useState<'allow' | 'deny'>('deny')

  const handleCreate = () => {
    if (!name.trim() || !permissionSlug.trim()) return
    onCreate({
      name: name.trim(),
      permissionSlug: permissionSlug.trim(),
      roleSlug: roleSlug.trim(),
      effect,
    })
    setName('')
    setPermissionSlug('')
    setRoleSlug('')
  }

  return (
    <div className="ios-panel p-4 space-y-4">
      <h3 className="font-display font-bold uppercase">ABAC policies</h3>
      <p className="text-sm text-muted">
        Deny policies override role permissions when conditions match (region, tribe, role slug).
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Policy name</FieldLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Regional deny" />
        </div>
        <div>
          <FieldLabel>Permission slug</FieldLabel>
          <Input
            value={permissionSlug}
            onChange={(e) => setPermissionSlug(e.target.value)}
            placeholder="submissions.review"
          />
        </div>
        <div>
          <FieldLabel>Role slug (optional)</FieldLabel>
          <Input
            value={roleSlug}
            onChange={(e) => setRoleSlug(e.target.value)}
            placeholder="regional-editor"
          />
        </div>
        <div>
          <FieldLabel>Effect</FieldLabel>
          <select
            className="ios-input w-full"
            value={effect}
            onChange={(e) => setEffect(e.target.value as 'allow' | 'deny')}
          >
            <option value="deny">Deny</option>
            <option value="allow">Allow</option>
          </select>
        </div>
      </div>
      <Button type="button" onClick={handleCreate}>
        Create policy
      </Button>

      <ul className="text-sm space-y-2 border-t border-border pt-4">
        {policies.map((p) => (
          <li key={p.id} className="flex justify-between gap-4">
            <span>
              <strong>{p.name}</strong>
              <span className="block text-xs text-muted">
                {p.effect} · {p.permission_slug ?? 'any'} · {p.role_slug ?? 'any role'}
              </span>
            </span>
            <span className="text-xs text-muted">{p.is_active ? 'Active' : 'Inactive'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
