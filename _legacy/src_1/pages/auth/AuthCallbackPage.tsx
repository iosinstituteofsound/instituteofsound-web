import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { completeAuthCallback } from '@/lib/auth/provider'
import { isSuperAdmin } from '@/lib/auth/roles'
import { resolvePostLoginPath } from '@/lib/auth/postLogin'
import { getMyEditorApplication } from '@/lib/editor-applications/service'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    completeAuthCallback()
      .then(async ({ user, intent }) => {
        if (cancelled) return

        if (intent === 'desk' && !isSuperAdmin(user.authorization)) {
          logout()
          setError('This Google account does not have editorial desk access.')
          return
        }

        let application = null
        try {
          application = await getMyEditorApplication(user.id)
        } catch {
          /* optional */
        }

        if (cancelled) return
        navigate(resolvePostLoginPath(user, intent, application), { replace: true })
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [navigate, logout])

  if (error) {
    return (
      <div className="auth-full-page section-padding text-center">
        <div className="max-w-md mx-auto ios-panel ios-panel-accent">
          <p className="text-mh-red text-sm">{error}</p>
          <Link to="/login" className="ios-link text-sm mt-6 inline-block">
            Try again with Google →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingTransmission variant="compact" />
    </div>
  )
}
