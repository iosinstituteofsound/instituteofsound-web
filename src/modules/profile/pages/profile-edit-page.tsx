import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { ProfileImageUpload } from '@/modules/profile/components/profile-image-upload'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import {
  profileBioSchema,
  profileOverviewSchema,
  profileUsernameSchema,
  type ProfileBioValues,
  type ProfileOverviewValues,
  type ProfileUsernameValues,
} from '@/modules/profile/schemas/profile.schema'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { toast } from '@/shared/components/ui/sonner'

export function ProfileEditPage() {
  const { data, isLoading, isError, refetch } = useMe()
  const updateProfile = useUpdateProfile()
  const user = data?.user

  const nameForm = useForm<ProfileOverviewValues>({
    resolver: zodResolver(profileOverviewSchema),
    defaultValues: { name: '' },
  })

  const bioForm = useForm<ProfileBioValues>({
    resolver: zodResolver(profileBioSchema),
    defaultValues: { bio: '', linkUrl: '' },
  })

  const usernameForm = useForm<ProfileUsernameValues>({
    resolver: zodResolver(profileUsernameSchema),
    defaultValues: { username: '' },
  })

  useEffect(() => {
    if (!user) return
    nameForm.reset({ name: user.name })
    bioForm.reset({ bio: user.bio ?? '', linkUrl: user.linkUrl ?? '' })
    usernameForm.reset({ username: user.username ?? '' })
  }, [user, nameForm, bioForm, usernameForm])

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
        <h1 className="text-xl font-bold">Edit profile</h1>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          <section className="p-4 sm:p-6">
            <ProfileImageUpload
              label="Profile picture"
              value={user.avatarUrl}
              aspect="square"
              disabled={updateProfile.isPending}
              onChange={async (url) => handleSave({ avatarUrl: url }, 'Profile picture updated')}
            />
          </section>

          <section className="p-4 sm:p-6">
            <ProfileImageUpload
              label="Cover photo"
              value={user.coverUrl}
              aspect="cover"
              disabled={updateProfile.isPending}
              onChange={async (url) => handleSave({ coverUrl: url }, 'Cover photo updated')}
            />
          </section>

          <section className="p-4 sm:p-6">
            <Form {...nameForm}>
              <form
                onSubmit={nameForm.handleSubmit((values) => handleSave(values, 'Name updated'))}
                className="space-y-3"
              >
                <FormField
                  control={nameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save name
                </Button>
              </form>
            </Form>
          </section>

          <section className="p-4 sm:p-6">
            <Form {...bioForm}>
              <form
                onSubmit={bioForm.handleSubmit((values) =>
                  handleSave(
                    { bio: values.bio?.trim() || null, linkUrl: values.linkUrl?.trim() || null },
                    'Bio updated',
                  ),
                )}
                className="space-y-3"
              >
                <FormField
                  control={bioForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} className="resize-none" placeholder="Say something about yourself..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bioForm.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save bio
                </Button>
              </form>
            </Form>
          </section>

          <section className="p-4 sm:p-6">
            <Form {...usernameForm}>
              <form
                onSubmit={usernameForm.handleSubmit((values) =>
                  handleSave({ username: values.username }, 'Username updated'),
                )}
                className="space-y-3"
              >
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">@</span>
                          <Input {...field} placeholder="username" className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save username
                </Button>
              </form>
            </Form>
          </section>

          <Link
            to="/profile/settings"
            className="flex items-center justify-between px-4 py-4 text-sm font-medium hover:bg-muted/50 sm:px-6"
          >
            Settings &amp; privacy
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
