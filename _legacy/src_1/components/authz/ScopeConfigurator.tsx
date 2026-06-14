import { useEffect, useState } from 'react'
import { FieldLabel } from '@/components/ui/Input'
import { fetchRegions, fetchTribes } from '@/services/api/authz.service'

export function ScopeConfigurator() {
  const [tribes, setTribes] = useState<{ id: string; name: string; slug: string }[]>([])
  const [regions, setRegions] = useState<{ id: string; name: string; slug: string }[]>([])

  useEffect(() => {
    void Promise.all([fetchTribes(), fetchRegions()]).then(([t, r]) => {
      setTribes((t.tribes ?? []) as { id: string; name: string; slug: string }[])
      setRegions((r.regions ?? []) as { id: string; name: string; slug: string }[])
    })
  }, [])

  return (
    <div className="ios-panel p-4 space-y-4">
      <h3 className="font-display font-bold uppercase">Scopes</h3>
      <p className="text-sm text-muted">
        Scope entities for tribe and region ABAC. Assign scopes to user roles via the admin API when
        configuring regional or tribe moderators.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Tribes</FieldLabel>
          <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
            {tribes.map((t) => (
              <li key={t.id}>
                {t.name} <span className="text-muted">({t.slug})</span>
              </li>
            ))}
            {tribes.length === 0 && <li className="text-muted">No tribes yet</li>}
          </ul>
        </div>
        <div>
          <FieldLabel>Regions</FieldLabel>
          <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
            {regions.map((r) => (
              <li key={r.id}>
                {r.name} <span className="text-muted">({r.slug})</span>
              </li>
            ))}
            {regions.length === 0 && <li className="text-muted">No regions yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
