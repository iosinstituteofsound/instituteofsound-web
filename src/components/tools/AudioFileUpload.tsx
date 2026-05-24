import { useCallback, useState } from 'react'
import clsx from 'clsx'

interface AudioFileUploadProps {
  onFile: (file: File) => void
  accept?: string
  label?: string
  busy?: boolean
}

export function AudioFileUpload({
  onFile,
  accept = 'audio/*',
  label = 'Drop audio or click to upload',
  busy,
}: AudioFileUploadProps) {
  const [drag, setDrag] = useState(false)

  const handle = useCallback(
    (file: File | undefined) => {
      if (!file || !file.type.startsWith('audio/')) return
      onFile(file)
    },
    [onFile]
  )

  return (
    <label
      className={clsx('ios-tools-upload', drag && 'ios-tools-upload-drag')}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        handle(e.dataTransfer.files[0])
      }}
    >
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <span className="ios-tools-upload-icon" aria-hidden>
        ♫
      </span>
      <span className="ios-tools-upload-label">{busy ? 'Analyzing…' : label}</span>
      <span className="ios-tools-upload-hint">MP3, WAV, FLAC, M4A · processed locally</span>
    </label>
  )
}
