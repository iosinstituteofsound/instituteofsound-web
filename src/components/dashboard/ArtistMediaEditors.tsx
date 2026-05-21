import { useState } from 'react'
import type { ArtistAlbum, ArtistTrack, ArtistVideo } from '@/lib/artist-profile/types'
import {
  deleteArtistAlbum,
  deleteArtistTrack,
  deleteArtistVideo,
  updateArtistAlbum,
  updateArtistTrack,
  updateArtistVideo,
} from '@/lib/artist-profile/service'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import { IOSImage } from '@/components/ui/IOSImage'

interface RowActions {
  onSaved: () => Promise<void>
  onDeleted: () => Promise<void>
}

export function EditableTrackRow({ track, ...actions }: { track: ArtistTrack } & RowActions) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(track.title)
  const [streamUrl, setStreamUrl] = useState(track.streamUrl)
  const [coverUrl, setCoverUrl] = useState(track.coverUrl ?? '')
  const [playCount, setPlayCount] = useState(String(track.playCount))
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle(track.title)
    setStreamUrl(track.streamUrl)
    setCoverUrl(track.coverUrl ?? '')
    setPlayCount(String(track.playCount))
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateArtistTrack(track.id, {
        title: title.trim() || track.title,
        streamUrl: streamUrl.trim() || track.streamUrl,
        coverUrl: coverUrl.trim() || undefined,
        playCount: parseInt(playCount, 10) || 0,
      })
      setEditing(false)
      await actions.onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex gap-3 items-center border border-border px-3 py-2 text-sm">
        {track.coverUrl ? (
          <IOSImage src={track.coverUrl} alt="" className="!w-10 !h-10 shrink-0 object-cover" />
        ) : (
          <div className="w-10 h-10 bg-surface shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{track.title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{track.streamUrl}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="text-xs uppercase ios-link" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="text-mh-red text-xs uppercase"
            onClick={async () => {
              await deleteArtistTrack(track.id)
              await actions.onDeleted()
            }}
          >
            Remove
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="border border-mh-red/40 px-3 py-4 space-y-3 text-sm">
      <FieldLabel>Edit track</FieldLabel>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <Input type="url" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="Stream URL" />
      <Input
        value={playCount}
        onChange={(e) => setPlayCount(e.target.value)}
        placeholder="Play count (display)"
      />
      <ImageUpload label="Cover" folder="ios/tracks" value={coverUrl} onChange={setCoverUrl} />
      <div className="flex gap-2">
        <Button type="button" variant="primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Cancel
        </Button>
      </div>
    </li>
  )
}

export function EditableAlbumRow({ album, ...actions }: { album: ArtistAlbum } & RowActions) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(album.title)
  const [year, setYear] = useState(album.releaseYear ? String(album.releaseYear) : '')
  const [releaseType, setReleaseType] = useState(album.releaseType)
  const [coverUrl, setCoverUrl] = useState(album.coverUrl ?? '')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle(album.title)
    setYear(album.releaseYear ? String(album.releaseYear) : '')
    setReleaseType(album.releaseType)
    setCoverUrl(album.coverUrl ?? '')
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateArtistAlbum(album.id, {
        title: title.trim() || album.title,
        releaseYear: year ? parseInt(year, 10) : undefined,
        releaseType,
        coverUrl: coverUrl.trim() || undefined,
      })
      setEditing(false)
      await actions.onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex gap-3 items-center border border-border px-3 py-2 text-sm">
        {album.coverUrl ? (
          <IOSImage src={album.coverUrl} alt="" className="!w-10 !h-10 shrink-0 object-cover" />
        ) : (
          <div className="w-10 h-10 bg-surface shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{album.title}</p>
          <p className="text-[10px] text-muted-foreground uppercase">
            {album.releaseType} {album.releaseYear ? `· ${album.releaseYear}` : ''}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="text-xs uppercase ios-link" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="text-mh-red text-xs uppercase"
            onClick={async () => {
              await deleteArtistAlbum(album.id)
              await actions.onDeleted()
            }}
          >
            Remove
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="border border-mh-red/40 px-3 py-4 space-y-3 text-sm">
      <FieldLabel>Edit release</FieldLabel>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <div className="flex gap-2 flex-wrap">
        <Input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          className="w-24"
        />
        <select
          value={releaseType}
          onChange={(e) => setReleaseType(e.target.value as 'album' | 'single' | 'ep')}
          className="ios-input flex-1 min-w-[120px]"
        >
          <option value="album">Album</option>
          <option value="single">Single</option>
          <option value="ep">EP</option>
        </select>
      </div>
      <ImageUpload label="Cover art" folder="ios/albums" value={coverUrl} onChange={setCoverUrl} />
      <div className="flex gap-2">
        <Button type="button" variant="primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Cancel
        </Button>
      </div>
    </li>
  )
}

export function EditableVideoRow({ video, ...actions }: { video: ArtistVideo } & RowActions) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(video.title)
  const [videoUrl, setVideoUrl] = useState(video.videoUrl)
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnailUrl ?? '')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle(video.title)
    setVideoUrl(video.videoUrl)
    setThumbnailUrl(video.thumbnailUrl ?? '')
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateArtistVideo(video.id, {
        title: title.trim() || video.title,
        videoUrl: videoUrl.trim() || video.videoUrl,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      })
      setEditing(false)
      await actions.onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex gap-3 items-center border border-border px-3 py-2 text-sm">
        {video.thumbnailUrl ? (
          <IOSImage src={video.thumbnailUrl} alt="" className="!w-10 !h-10 shrink-0 object-cover" />
        ) : (
          <div className="w-10 h-10 bg-surface shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{video.title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{video.videoUrl}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="text-xs uppercase ios-link" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="text-mh-red text-xs uppercase"
            onClick={async () => {
              await deleteArtistVideo(video.id)
              await actions.onDeleted()
            }}
          >
            Remove
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="border border-mh-red/40 px-3 py-4 space-y-3 text-sm">
      <FieldLabel>Edit video</FieldLabel>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <Input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL" />
      <ImageUpload
        label="Thumbnail"
        folder="ios/artists"
        value={thumbnailUrl}
        onChange={setThumbnailUrl}
      />
      <div className="flex gap-2">
        <Button type="button" variant="primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Cancel
        </Button>
      </div>
    </li>
  )
}
