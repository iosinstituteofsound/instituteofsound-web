import { Check, Pause, Play, Plus, SkipBack, SkipForward, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'
import {
  TIMELINE_CLIP_MIME,
  type PlaybackMode,
  type TimelineClip,
} from '@/modules/illustrator/components/studio/studio-animation.types'
import { useAnimationAssist } from '@/modules/illustrator/components/studio/use-animation-assist'
import { useStudioDocument } from '@/modules/illustrator/components/studio/studio-document-context'
import { useVirtualTimeline } from '@/modules/illustrator/components/studio/use-virtual-timeline'
import {
  TIMELINE_TRACK_HEIGHT,
  timelineTrackIndexFromY,
  timelineTrackTop,
  useVirtualTracks,
} from '@/modules/illustrator/components/studio/use-virtual-tracks'
import type { FrameDocumentState } from '@/modules/illustrator/lib/studio-frame-store'
import type { OnionSkinPreview } from '@/modules/illustrator/components/studio/studio-animation.types'
import { cn } from '@/shared/lib/cn'

function formatTimelineClock(frame: number, fps = 24) {
  const totalSeconds = Math.floor(frame / fps)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

type StudioTimelineProps = {
  captureSnapshot: () => FrameDocumentState
  applySnapshot: (layers: FrameDocumentState['layers'], elements: FrameDocumentState['elements']) => void
  onOnionSkinPreviewChange?: (preview: OnionSkinPreview | null) => void
}

type ClipDragState = {
  clipId: string
  originFrame: number
  originTrackId: string
  startX: number
  startY: number
  trackHeight: number
}

const PLAYBACK_MODES: Array<{ id: PlaybackMode; label: string }> = [
  { id: 'loop', label: 'Loop' },
  { id: 'ping-pong', label: 'Ping-Pong' },
  { id: 'one-shot', label: 'One Shot' },
]

export function StudioTimeline({ captureSnapshot, applySnapshot, onOnionSkinPreviewChange }: StudioTimelineProps) {
  const studioDocument = useStudioDocument()
  const layers = studioDocument?.snapshot.layers ?? []
  const layerThumbnails = studioDocument?.snapshot.layerThumbnails ?? {}

  const assist = useAnimationAssist({
    layers,
    layerThumbnails,
    captureSnapshot,
    applySnapshot,
    onOnionSkinPreviewChange,
    pixelsPerFrame: 3,
  })

  const timeline = useVirtualTimeline(assist.totalFrames, assist.pixelsPerFrame)
  const playheadX = timeline.frameToX(assist.currentFrame)
  const trackAreaRef = useRef<HTMLDivElement | null>(null)
  const labelsRef = useRef<HTMLDivElement | null>(null)
  const [trackScrollEl, setTrackScrollEl] = useState<HTMLDivElement | null>(null)
  const virtualTracks = useVirtualTracks(assist.tracks.length, trackScrollEl)
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null)
  const settingsPanelRef = useRef<HTMLDivElement | null>(null)
  const [settingsAnchor, setSettingsAnchor] = useState<{ top: number; right: number } | null>(null)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const clipDragRef = useRef<ClipDragState | null>(null)
  const scrubbingRef = useRef(false)
  const [dragClip, setDragClip] = useState<{ id: string; trackId: string; startFrame: number } | null>(null)
  const [dropTargetTrackId, setDropTargetTrackId] = useState<string | null>(null)

  const resolveTrackFromY = useCallback(
    (clientY: number) => {
      const area = trackAreaRef.current
      if (!area || !assist.tracks.length) return assist.tracks[0]?.id ?? ''
      const rect = area.getBoundingClientRect()
      const index = timelineTrackIndexFromY(area.scrollTop, clientY, rect.top)
      const clamped = Math.min(index, assist.tracks.length - 1)
      return assist.tracks[clamped]?.id ?? assist.tracks[0]?.id ?? ''
    },
    [assist.tracks],
  )

  const handleClipPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, clip: TimelineClip) => {
      event.preventDefault()
      event.stopPropagation()
      assist.beginScrub()
      clipDragRef.current = {
        clipId: clip.id,
        originFrame: clip.startFrame,
        originTrackId: clip.trackId,
        startX: event.clientX,
        startY: event.clientY,
        trackHeight: TIMELINE_TRACK_HEIGHT,
      }
      setDragClip({ id: clip.id, trackId: clip.trackId, startFrame: clip.startFrame })
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [assist],
  )

  const handleClipPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = clipDragRef.current
      if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return
      const deltaX = event.clientX - drag.startX
      const deltaFrames = Math.round(deltaX / assist.pixelsPerFrame)
      const nextFrame = Math.max(0, drag.originFrame + deltaFrames)
      const nextTrackId = resolveTrackFromY(event.clientY)
      setDragClip({ id: drag.clipId, trackId: nextTrackId, startFrame: nextFrame })
      setDropTargetTrackId(nextTrackId)
    },
    [assist.pixelsPerFrame, resolveTrackFromY],
  )

  const handleClipPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = clipDragRef.current
      if (!drag) return
      const deltaX = event.clientX - drag.startX
      const deltaFrames = Math.round(deltaX / assist.pixelsPerFrame)
      const nextFrame = Math.max(0, drag.originFrame + deltaFrames)
      const nextTrackId = resolveTrackFromY(event.clientY)
      assist.moveClip(drag.clipId, nextTrackId, nextFrame)
      clipDragRef.current = null
      setDragClip(null)
      setDropTargetTrackId(null)
      assist.endScrub()
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    [assist, assist.pixelsPerFrame, resolveTrackFromY],
  )

  const handleTrackDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, trackId: string) => {
      event.preventDefault()
      const area = trackAreaRef.current
      if (!area) return
      const rect = area.getBoundingClientRect()
      const x = event.clientX - rect.left + area.scrollLeft
      const frame = timeline.xToFrame(x)
      const clipId = event.dataTransfer.getData(TIMELINE_CLIP_MIME)
      if (clipId) {
        const clip = assist.clips.find((entry) => entry.id === clipId)
        if (clip) assist.moveClip(clip.id, trackId, frame)
        return
      }
      const label = event.dataTransfer.getData('text/plain') || 'Library clip'
      assist.addLibraryClip(trackId, frame, label)
      setDropTargetTrackId(null)
    },
    [assist, timeline],
  )

  const handleTrackDragOver = useCallback((event: React.DragEvent<HTMLDivElement>, trackId: string) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTargetTrackId(trackId)
  }, [])

  useEffect(() => {
    setPortalRoot(window.document.querySelector('.mas-studio'))
  }, [])

  useLayoutEffect(() => {
    if (!assist.settingsOpen || !settingsBtnRef.current) {
      setSettingsAnchor(null)
      return
    }

    const update = () => {
      const button = settingsBtnRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      setSettingsAnchor({
        top: rect.top - 10,
        right: Math.max(12, window.innerWidth - rect.right),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [assist.settingsOpen])

  useEffect(() => {
    if (!assist.settingsOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (settingsPanelRef.current?.contains(target)) return
      if (settingsBtnRef.current?.contains(target)) return
      assist.setSettingsOpen(false)
      assist.setColorsOpen(false)
    }

    window.document.addEventListener('pointerdown', onPointerDown)
    return () => window.document.removeEventListener('pointerdown', onPointerDown)
  }, [assist.settingsOpen, assist.setSettingsOpen, assist.setColorsOpen])

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const area = trackAreaRef.current
      if (!area) return
      const rect = area.getBoundingClientRect()
      const x = clientX - rect.left + area.scrollLeft
      assist.seekFrame(timeline.xToFrame(x))
    },
    [assist, timeline],
  )

  const handleTrackScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      timeline.onTrackScroll(event)
      if (labelsRef.current) {
        labelsRef.current.scrollTop = event.currentTarget.scrollTop
      }
    },
    [timeline],
  )

  const renderClip = (clip: TimelineClip, isGhost = false) => {
    const active = dragClip?.id === clip.id
    const frame = active && dragClip ? dragClip.startFrame : clip.startFrame
    const trackId = active && dragClip ? dragClip.trackId : clip.trackId
    const trackIndex = assist.trackIndexById.get(trackId) ?? -1
    if (trackIndex < 0) return null
    const left = timeline.frameToX(frame)
    const width = Math.max(assist.pixelsPerFrame * clip.durationFrames, 18)

    return (
      <button
        key={isGhost ? `${clip.id}-ghost` : clip.id}
        type="button"
        className={cn(
          'mas-clip mas-timeline__virtual-clip',
          active && 'mas-clip--active mas-timeline__clip--dragging',
          frame === assist.currentFrame && 'mas-timeline__clip--playhead',
        )}
        style={{
          left,
          width,
          top: timelineTrackTop(trackIndex),
        }}
        draggable={!isGhost}
        onDragStart={(event) => {
          event.dataTransfer.setData(TIMELINE_CLIP_MIME, clip.id)
          event.dataTransfer.effectAllowed = 'move'
        }}
        onPointerDown={(event) => handleClipPointerDown(event, clip)}
        onPointerMove={handleClipPointerMove}
        onPointerUp={handleClipPointerUp}
        onPointerCancel={handleClipPointerUp}
        aria-label={`${clip.label} at frame ${frame}`}
      >
        {clip.thumbUrl ? (
          <span className="mas-timeline__clip-thumb" style={{ backgroundImage: `url(${clip.thumbUrl})` }} />
        ) : null}
      </button>
    )
  }

  const visibleClips = assist.clips.filter((clip) => {
    const end = clip.startFrame + clip.durationFrames
    const horizontallyVisible = end >= timeline.visibleRange.start && clip.startFrame <= timeline.visibleRange.end
    if (!horizontallyVisible) return false
    if (dragClip?.id === clip.id) return true
    const trackIndex = assist.trackIndexById.get(clip.trackId)
    if (trackIndex === undefined) return false
    return virtualTracks.visibleTrackIndices.has(trackIndex)
  })

  return (
    <StudioGlass className="mas-timeline">
      <div className="mas-timeline__head">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn('mas-icon-btn', assist.isPlaying && 'mas-icon-btn--active')}
            aria-label={assist.isPlaying ? 'Pause' : 'Play'}
            onClick={assist.togglePlayback}
          >
            {assist.isPlaying ? (
              <Pause size={14} strokeWidth={1.75} />
            ) : (
              <Play size={14} strokeWidth={1.75} fill="currentColor" />
            )}
          </button>
          <button type="button" className="mas-icon-btn" aria-label="Skip back" onClick={() => assist.stepFrame(-1)}>
            <SkipBack size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="mas-icon-btn" aria-label="Skip forward" onClick={() => assist.stepFrame(1)}>
            <SkipForward size={14} strokeWidth={1.75} />
          </button>
          <span className="mas-timeline__title">Animation Assist</span>
        </div>
        <span className="mas-timeline__time">
          {formatTimelineClock(assist.currentFrame, assist.settings.fps)} /{' '}
          {formatTimelineClock(assist.totalFrames, assist.settings.fps)}
        </span>
      </div>

      <div className="mas-timeline__body">
        <div ref={labelsRef} className="mas-timeline__labels mas-timeline__labels--virtual">
          <div className="mas-timeline__labels-rail" style={{ height: virtualTracks.totalHeight }}>
            {virtualTracks.virtualItems.map((item) => {
              const track = assist.tracks[item.index]
              if (!track) return null
              return (
                <button
                  key={track.id}
                  type="button"
                  className="mas-timeline__label-btn truncate"
                  style={{
                    top: item.start,
                    height: item.size,
                  }}
                  title={`Add clip on ${track.label}`}
                  onDoubleClick={() => assist.addLibraryClip(track.id, assist.currentFrame, track.label)}
                >
                  {track.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          ref={(node) => {
            timeline.setTrackEl(node)
            trackAreaRef.current = node
            setTrackScrollEl(node)
          }}
          className="mas-timeline__tracks mas-timeline__tracks--virtual"
          onScroll={handleTrackScroll}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest('.mas-timeline__virtual-clip')) return
            scrubbingRef.current = true
            assist.beginScrub()
            seekFromClientX(event.clientX)
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (!scrubbingRef.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return
            seekFromClientX(event.clientX)
          }}
          onPointerUp={(event) => {
            if (!scrubbingRef.current) return
            scrubbingRef.current = false
            assist.endScrub()
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          }}
          onPointerCancel={(event) => {
            scrubbingRef.current = false
            assist.endScrub()
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          }}
        >
          <div
            className="mas-timeline__virtual-rail"
            style={{ width: timeline.contentWidth, height: virtualTracks.totalHeight }}
          >
            <div className="mas-timeline__playhead" style={{ left: playheadX }} aria-hidden />

            {virtualTracks.virtualItems.map((item) => {
              const track = assist.tracks[item.index]
              if (!track) return null
              return (
                <div
                  key={track.id}
                  className={cn(
                    'mas-timeline__virtual-track',
                    dropTargetTrackId === track.id && 'mas-timeline__virtual-track--drop',
                  )}
                  style={{ top: item.start }}
                  onDragOver={(event) => handleTrackDragOver(event, track.id)}
                  onDragLeave={() => setDropTargetTrackId(null)}
                  onDrop={(event) => handleTrackDrop(event, track.id)}
                />
              )
            })}

            {visibleClips.map((clip) => renderClip(clip))}
          </div>
        </div>
      </div>

      <div className="mas-timeline__assist-bar">
        <button type="button" className="mas-timeline__assist-btn" onClick={assist.togglePlayback}>
          {assist.isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="mas-timeline__frame-strip">
          {assist.frameThumbs.map((thumb) => (
            <button
              key={thumb.index}
              type="button"
              className={cn(
                'mas-timeline__frame-thumb',
                thumb.index === assist.currentFrame && 'mas-timeline__frame-thumb--active',
              )}
              onClick={() => assist.seekFrame(thumb.index)}
              aria-label={`Frame ${thumb.index + 1}`}
            >
              {thumb.previewUrl ? (
                <span style={{ backgroundImage: `url(${thumb.previewUrl})` }} />
              ) : (
                <span className="mas-timeline__frame-thumb-empty" />
              )}
            </button>
          ))}
        </div>

        <div className="mas-timeline__assist-actions">
          <button
            ref={settingsBtnRef}
            type="button"
            className="mas-timeline__assist-btn"
            data-studio-overlay-trigger="timeline-settings"
            onClick={(event) => {
              event.stopPropagation()
              assist.setSettingsOpen((open) => !open)
            }}
          >
            Settings
          </button>
          <button type="button" className="mas-timeline__assist-btn mas-timeline__assist-btn--accent" onClick={assist.addFrame}>
            <Plus size={14} strokeWidth={2} />
            Add Frame
          </button>
        </div>
      </div>

      {assist.settingsOpen && settingsAnchor && portalRoot
        ? createPortal(
            <div
              ref={settingsPanelRef}
              className="mas-timeline__settings mas-timeline__settings--portal"
              data-studio-overlay="timeline-settings"
              style={{ top: settingsAnchor.top, right: settingsAnchor.right }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mas-timeline__settings-head">
                <span>Settings</span>
                <button type="button" aria-label="Close settings" onClick={() => assist.setSettingsOpen(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="mas-timeline__settings-group">
                {PLAYBACK_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={cn(
                      'mas-timeline__settings-mode',
                      assist.settings.playbackMode === mode.id && 'mas-timeline__settings-mode--active',
                    )}
                    onClick={() => assist.setPlaybackMode(mode.id)}
                  >
                    <span>{mode.label}</span>
                    {assist.settings.playbackMode === mode.id ? <Check size={14} strokeWidth={2} /> : null}
                  </button>
                ))}
              </div>

              <label className="mas-timeline__settings-slider">
                <span>Frames Per Second</span>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={assist.settings.fps}
                  onChange={(event) => assist.updateSettings({ fps: Number(event.target.value) })}
                />
                <strong>{assist.settings.fps}</strong>
              </label>

              <label className="mas-timeline__settings-slider">
                <span>Onion skin frames</span>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={assist.settings.onionSkinFrames}
                  onChange={(event) => assist.updateSettings({ onionSkinFrames: Number(event.target.value) })}
                />
                <strong>{assist.settings.onionSkinFrames >= 12 ? 'Max' : assist.settings.onionSkinFrames}</strong>
              </label>

              <label className="mas-timeline__settings-slider">
                <span>Onion skin opacity</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={assist.settings.onionSkinOpacity}
                  onChange={(event) => assist.updateSettings({ onionSkinOpacity: Number(event.target.value) })}
                />
                <strong>{assist.settings.onionSkinOpacity} %</strong>
              </label>

              <label className="mas-timeline__settings-toggle">
                <span>Blend primary frame</span>
                <input
                  type="checkbox"
                  checked={assist.settings.blendPrimaryFrame}
                  onChange={(event) => assist.updateSettings({ blendPrimaryFrame: event.target.checked })}
                />
              </label>

              <button
                type="button"
                className="mas-timeline__settings-link"
                onClick={() => assist.setColorsOpen((open) => !open)}
              >
                Onion skin colours
              </button>

              {assist.colorsOpen ? (
                <div className="mas-timeline__settings-colors">
                  <label className="mas-timeline__settings-color">
                    <span>Previous frames</span>
                    <input
                      type="color"
                      value={assist.settings.onionSkinColorBefore}
                      onChange={(event) => assist.updateSettings({ onionSkinColorBefore: event.target.value })}
                    />
                  </label>
                  <label className="mas-timeline__settings-color">
                    <span>Next frames</span>
                    <input
                      type="color"
                      value={assist.settings.onionSkinColorAfter}
                      onChange={(event) => assist.updateSettings({ onionSkinColorAfter: event.target.value })}
                    />
                  </label>
                </div>
              ) : null}
            </div>,
            portalRoot,
          )
        : null}
    </StudioGlass>
  )
}
