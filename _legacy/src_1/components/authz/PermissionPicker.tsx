import type { Permission } from '@/services/api/authz.service'

interface PermissionPickerProps {
  permissions: Permission[]
  selected: Set<string>
  onToggle: (slug: string) => void
}

export function PermissionPicker({ permissions, selected, onToggle }: PermissionPickerProps) {
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const g = p.group_id ?? 'other'
    acc[g] = acc[g] ?? []
    acc[g].push(p)
    return acc
  }, {})

  return (
    <div className="max-h-96 overflow-y-auto space-y-4">
      {Object.entries(grouped).map(([groupId, perms]) => (
        <div key={groupId}>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">{groupId}</p>
          <ul className="space-y-1">
            {perms.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(p.slug)}
                    onChange={() => onToggle(p.slug)}
                  />
                  <code className="text-xs">{p.slug}</code>
                  <span className="text-muted">{p.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
