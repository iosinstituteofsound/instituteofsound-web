import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react'
import { VerifiedBadge } from '@/shared/components/icons/verified-badge'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import {
  profileAccountSchema,
  profilePrivacySchema,
  type ProfileAccountValues,
  type ProfilePrivacyValues,
} from '@/modules/profile/schemas/profile.schema'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { toast } from '@/shared/components/ui/sonner'

export function ProfileSettingsPage() {
  const { data, isLoading, isError, refetch } = useMe()
  const updateProfile = useUpdateProfile()
  const user = data?.user
  const privacy = user?.privacySettings

  const privacyForm = useForm<ProfilePrivacyValues>({
    resolver: zodResolver(profilePrivacySchema),
    defaultValues: {
      showEmail: false,
      showBio: true,
      showListeningActivity: true,
      allowDirectMessages: true,
    },
  })

  const accountForm = useForm<ProfileAccountValues>({
    resolver: zodResolver(profileAccountSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!user) return
    accountForm.reset({ name: user.name })
    privacyForm.reset({
      showEmail: privacy?.showEmail ?? false,
      showBio: privacy?.showBio ?? true,
      showListeningActivity: privacy?.showListeningActivity ?? true,
      allowDirectMessages: privacy?.allowDirectMessages ?? true,
    })
  }, [user, privacy, accountForm, privacyForm])

  const handleSave = async (values: Record<string, unknown>, message: string) => {
    try {
      await updateProfile.mutateAsync(values)
      toast.success(message)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to save'
      toast.error(message)
    }
  }

  if (isLoading) return <PageLoader />
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link to="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Settings &amp; privacy</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
          <CardDescription>Control who can see your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...privacyForm}>
            <form
              onSubmit={privacyForm.handleSubmit((values) =>
                handleSave({ privacySettings: values }, 'Privacy settings saved'),
              )}
              className="space-y-1"
            >
              {(
                [
                  ['showEmail', 'Show email on profile'],
                  ['showBio', 'Show bio on profile'],
                  ['showListeningActivity', 'Show listening activity'],
                  ['allowDirectMessages', 'Allow direct messages'],
                ] as const
              ).map(([name, title]) => (
                <FormField
                  key={name}
                  control={privacyForm.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4 rounded-lg px-1 py-3">
                      <FormLabel className="font-normal">{title}</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
              <Button type="submit" size="sm" className="mt-2" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save privacy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.isVerified ? (
            <div className="flex items-center gap-2 text-sm">
              <VerifiedBadge size="md" />
              Your account is verified.
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Complete your profile, then request verification when ready.</p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled>
                Request verification (coming soon)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.authorization.roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
          <Form {...accountForm}>
            <form
              onSubmit={accountForm.handleSubmit((values) => handleSave(values, 'Account updated'))}
              className="space-y-3"
            >
              <FormField
                control={accountForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update name
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
