import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { PlaylistCreateInput } from '@/modules/music/lib/playlist-api'
import { playlistCapabilities } from '@/modules/music/lib/playlist-capabilities'
import { ProfileImageUpload } from '@/modules/profile/components/profile-image-upload'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

type CreatePlaylistDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: PlaylistCreateInput) => void
  isSubmitting?: boolean
}

export function CreatePlaylistDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreatePlaylistDialogProps) {
  const { hasRichMetadata } = playlistCapabilities()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')

  useEffect(() => {
    if (!open) return
    setTitle('')
    setDescription('')
    setCoverUrl('')
    setVisibility('private')
  }, [open])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      visibility,
      ...(hasRichMetadata
        ? {
            description: description.trim() || undefined,
            coverUrl: coverUrl || undefined,
          }
        : {}),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New playlist</DialogTitle>
            <DialogDescription>
              {hasRichMetadata
                ? 'Add a title, cover, and description for your playlist.'
                : 'Give your playlist a name and choose who can see it.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {hasRichMetadata ? (
              <ProfileImageUpload
                label="Cover art"
                description="Square · PNG or JPG"
                size="lg"
                value={coverUrl}
                onChange={(url) => setCoverUrl(url ?? '')}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="create-playlist-title">Title</Label>
              <Input
                id="create-playlist-title"
                placeholder="Playlist name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {hasRichMetadata ? (
              <div className="space-y-2">
                <Label htmlFor="create-playlist-description">Description</Label>
                <Textarea
                  id="create-playlist-description"
                  placeholder="What is this playlist about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="create-playlist-visibility">Visibility</Label>
              <select
                id="create-playlist-visibility"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
