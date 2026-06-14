import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { updatePreferredLayout } from '@/services/api/authz.service'
import type { LayoutSummary } from '@/lib/auth/types'

interface LayoutPickerProps {
  layouts: LayoutSummary[]
  preferredLayoutId?: string
  onSelected?: () => void
}

export function LayoutPicker({ layouts, preferredLayoutId, onSelected }: LayoutPickerProps) {
  const { refreshUser } = useAuth()
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')

  if (layouts.length <= 1) return null

  const select = async (layoutId: string) => {
    setSaving(layoutId)
    setError('')
    try {
      await updatePreferredLayout(layoutId)
      await refreshUser()
      onSelected?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save layout')
    } finally {
      setSaving('')
    }
  }

  return (
    <div className="ios-panel p-4 space-y-3">
      <p className="ios-kicker">Workspace layout</p>
      <p className="text-sm text-muted">Choose which dashboard shell to use for your assigned roles.</p>
      <div className="flex flex-wrap gap-2">
        {layouts.map((layout) => (
          <Button
            key={layout.id}
            type="button"
            variant={preferredLayoutId === layout.id ? 'primary' : 'secondary'}
            disabled={saving === layout.id}
            onClick={() => void select(layout.id)}
          >
            {layout.name}
          </Button>
        ))}
      </div>
      {error && <p className="text-sm text-mh-red">{error}</p>}
    </div>
  )
}
