import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDevLogin, useGoogleLogin } from '@/modules/auth/hooks/use-auth'
import { devLoginSchema, type DevLoginFormValues } from '@/modules/auth/schemas/dev-login.schema'
import { Button } from '@/shared/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { useLayoutStore } from '@/app/stores/layout-store'
import { getLayoutHomeRouteFromLayout } from '@/shared/lib/layout-home-route'
import { apiUrl, env } from '@/shared/config/env'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LoginPage() {
  const { login: googleLogin } = useGoogleLogin()
  const devLogin = useDevLogin()
  const navigate = useNavigate()
  const [oauthRedirectUri, setOauthRedirectUri] = useState<string | null>(null)

  useEffect(() => {
    if (!env.isDev) return
    const returnTo = `${window.location.origin}/auth/callback`
    fetch(apiUrl(`/api/auth/oauth-setup?return_to=${encodeURIComponent(returnTo)}`))
      .then((r) => r.json())
      .then((data: { redirectUri?: string }) => {
        if (data.redirectUri) setOauthRedirectUri(data.redirectUri)
      })
      .catch(() => {
        setOauthRedirectUri('http://localhost:4000/api/auth/callback')
      })
  }, [])

  const form = useForm<DevLoginFormValues>({
    resolver: zodResolver(devLoginSchema),
    defaultValues: { email: '' },
  })

  const onDevLogin = form.handleSubmit(async (values) => {
    try {
      const email = values.email?.trim()
      await devLogin.mutateAsync(email ? { email } : {})
      toast.success('Signed in successfully')
      navigate(getLayoutHomeRouteFromLayout(useLayoutStore.getState().activeLayout))
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Login failed'
      toast.error(message)
    }
  })

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-black/10 backdrop-blur-sm sm:p-8">
      <div className="space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-lg font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Continue with your Google account.</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-11 w-full rounded-xl border-border/80 bg-background text-[15px] font-medium',
            'hover:bg-muted/50',
          )}
          onClick={() => googleLogin()}
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link to="/auth/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>

        {env.isDev ? (
          <>
            <Separator />
            <details className="group rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm">
              <summary className="cursor-pointer list-none font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                Developer options
              </summary>
              <div className="mt-4 space-y-4">
                {oauthRedirectUri ? (
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground/80">Google OAuth redirect URI</p>
                    <code className="block break-all rounded-md bg-background/80 px-2 py-1.5 text-[11px] text-foreground/90 ring-1 ring-border/50">
                      {oauthRedirectUri}
                    </code>
                  </div>
                ) : null}

                <Form {...form}>
                  <form onSubmit={onDevLogin} className="space-y-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="dev@dev.local"
                              autoComplete="email"
                              className="h-9 rounded-lg bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="h-9 w-full rounded-lg"
                      disabled={devLogin.isPending}
                    >
                      {devLogin.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        'Dev login'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </details>
          </>
        ) : null}
      </div>
    </div>
  )
}
