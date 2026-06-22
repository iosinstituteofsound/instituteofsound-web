import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'
import type { PlaylistUpdateInput } from '@/modules/music/lib/playlist-api'
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

type PlaylistSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist: PlaylistDetailDto
  onSave: (input: PlaylistUpdateInput) => void
  isSaving?: boolean
}

export function PlaylistSettingsDialog({
  open,
  onOpenChange,
  playlist,
  onSave,
  isSaving,
}: PlaylistSettingsDialogProps) {
  const { hasRichMetadata } = playlistCapabilities()
  const [title, setTitle] = useState(playlist.title)
  const [description, setDescription] = useState(playlist.description ?? '')
  const [coverUrl, setCoverUrl] = useState(playlist.coverUrl ?? '')
  const [visibility, setVisibility] = useState(playlist.visibility)

  useEffect(() => {
    if (!open) return
    setTitle(playlist.title)
    setDescription(playlist.description ?? '')
    setCoverUrl(playlist.coverUrl ?? '')
    setVisibility(playlist.visibility)
  }, [open, playlist])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    onSave({
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
            <DialogTitle>Playlist settings</DialogTitle>
            <DialogDescription>Update your playlist details.</DialogDescription>
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
              <Label htmlFor="settings-playlist-title">Title</Label>
              <Input
                id="settings-playlist-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {hasRichMetadata ? (
              <div className="space-y-2">
                <Label htmlFor="settings-playlist-description">Description</Label>
                <Textarea
                  id="settings-playlist-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="settings-playlist-visibility">Visibility</Label>
              <select
                id="settings-playlist-visibility"
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
            <Button type="submit" disabled={!title.trim() || isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
