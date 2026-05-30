import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isEditorStaff } from '@/lib/auth/roles'
import { getMyEditorApplication } from '@/lib/editor-applications/service'
import type { EditorApplication } from '@/lib/editor-applications/types'
import { EditorApplicationForm } from '@/components/editor-applications/EditorApplicationForm'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function EditorApplyPage() {
  const { user } = useAuth()
  const [application, setApplication] = useState<EditorApplication | null | undefined>(undefined)

  const reload = useCallback(async () => {
    if (!user) return
    setApplication(await getMyEditorApplication(user.id))
  }, [user])

  useEffect(() => {
    void reload()
  }, [reload])

  if (!user) {
    return <Navigate to="/editor/join" replace />
  }

  if (isEditorStaff(user.role)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  if (application === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <LoadingTransmission variant="compact" />
      </div>
    )
  }

  return (
    <div className="section-padding pt-28 min-h-screen max-w-2xl mx-auto">
      <p className="ios-kicker">Editorial desk</p>
      <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">Apply to become an editor</h1>

      {application?.status === 'pending' && (
        <div className="mt-6 border border-amber-500/40 bg-amber-500/5 px-4 py-4 text-sm">
          <p className="font-medium text-amber-400">Application under review</p>
          <p className="text-muted mt-2">
            Submitted {new Date(application.createdAt).toLocaleString()}. IOS Support will
            review your portfolio and message. You will be notified here when a decision is made.
          </p>
        </div>
      )}

      {application?.status === 'rejected' && (
        <div className="mt-6 border border-border px-4 py-4 text-sm">
          <p className="text-mh-red font-medium">Application not approved</p>
          <p className="text-muted mt-2">
            You may submit a new application with updated links and motivation.
          </p>
        </div>
      )}

      {(!application || application.status === 'rejected') && (
        <div className="mt-8">
          <EditorApplicationForm userId={user.id} onSubmitted={() => void reload()} />
        </div>
      )}

      <p className="text-xs text-muted mt-8">
        <Link to="/artist/dashboard" className="ios-link">
          ← Artist dashboard
        </Link>
      </p>
    </div>
  )
}
