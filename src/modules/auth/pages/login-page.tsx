import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useDevLogin, useGoogleLogin } from '@/modules/auth/hooks/use-auth'
import { devLoginSchema, type DevLoginFormValues } from '@/modules/auth/schemas/dev-login.schema'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { useLayoutStore } from '@/app/stores/layout-store'
import { getLayoutHomeRouteFromLayout } from '@/shared/lib/layout-home-route'
import { apiUrl, env } from '@/shared/config/env'
import { toast } from '@/shared/components/ui/sonner'

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
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Login failed'
      toast.error(message)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in with Google or use dev login in development.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={() => googleLogin()}>
          Continue with Google
        </Button>

        {env.isDev && oauthRedirectUri && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            <p className="font-medium text-amber-100">Google Console redirect URI (copy exactly):</p>
            <code className="mt-1 block break-all text-amber-50">{oauthRedirectUri}</code>
            <p className="mt-2 text-amber-200/80">
              Register this EXACTLY in Google Console. Dev uses API port <strong>4000</strong>.
            </p>
          </div>
        )}

        {env.isDev && (
          <Form {...form}>
            <form onSubmit={onDevLogin} className="space-y-4 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Development quick login — new users get the Listener role automatically.
              </p>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="dev@dev.local"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="secondary" className="w-full" disabled={devLogin.isPending}>
                Dev Login
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
