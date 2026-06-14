import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { parseAuthHash } from '@/modules/auth/api/auth.api'
import { meQueryKey, useMe } from '@/modules/auth/hooks/use-auth'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { PageLoader } from '@/shared/components/feedback/loader'
import { toast } from '@/shared/components/ui/sonner'
import { getLayoutHomeRoute } from '@/shared/lib/layout-home-route'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { refetch } = useMe(false)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const finishLogin = () =>
      queryClient.removeQueries({ queryKey: meQueryKey })
        .then(() => refetch())
        .then((result) => navigate(getLayoutHomeRoute(result.data?.authorization), { replace: true }))
        .catch(() => {
          toast.error('Failed to load session')
          navigate('/auth/login', { replace: true })
        })

    // StrictMode re-mount: tokens may already be stored from first pass
    if (tokenStorage.hasSession()) {
      void finishLogin()
      return
    }

    const errorParam = new URLSearchParams(window.location.search).get('error')
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam))
      navigate('/auth/login', { replace: true })
      return
    }

    const tokens = parseAuthHash(window.location.hash)
    if (!tokens) {
      toast.error('Invalid auth callback')
      navigate('/auth/login', { replace: true })
      return
    }

    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken)
    window.history.replaceState(null, '', window.location.pathname)

    void finishLogin()
  }, [navigate, queryClient, refetch])

  return <PageLoader />
}
