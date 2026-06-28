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
import { useSequenceAssist } from '@/modules/illustrator/components/studio/use-sequence-assist'
import { SequenceBreadcrumb } from '@/modules/illustrator/components/studio/sequence-breadcrumb'
import { isSequenceEngineEnabled } from '@/modules/illustrator/lib/sequence/feature-flag'
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
import { snapshotThumbnailDataUrl } from '@/modules/illustrator/components/studio/studio-layer-engine'

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
  mode: 'move' | 'resize'
  originDurationFrames?: number
  moved: boolean
}

const PLAYBACK_MODES: Array<{ id: PlaybackMode; label: string }> = [
  { id: 'loop', label: 'Loop' },
  { id: 'ping-pong', label: 'Ping-Pong' },
  { id: 'one-shot', label: 'One Shot' },
]

type TimelineAssistHook = typeof useAnimationAssist

export function StudioTimeline(props: StudioTimelineProps) {
  if (isSequenceEngineEnabled()) {
    return <StudioTimelineInner {...props} useAssist={useSequenceAssist} panelTitle="Infinite Sequence" />
  }
  return <StudioTimelineInner {...props} useAssist={useAnimationAssist} panelTitle="Animation Assist" />
}

function StudioTimelineInner({
  captureSnapshot,
  applySnapshot,
  onOnionSkinPreviewChange,
  useAssist,
  panelTitle,
}: StudioTimelineProps & { useAssist: TimelineAssistHook; panelTitle: string }) {
  const studioDocument = useStudioDocument()
  const layers = studioDocument?.snapshot.layers ?? []
  const layerThumbnails = studioDocument?.snapshot.layerThumbnails ?? {}

  const assist = useAssist({
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
  const clipTapRef = useRef<{ clipId: string; time: number } | null>(null)
  const scrubbingRef = useRef(false)
  const [dragClip, setDragClip] = useState<{ id: string; trackId: string; startFrame: number; durationFrames?: number } | null>(null)
  const [snapFlash, setSnapFlash] = useState(false)
  const sequenceMode = isSequenceEngineEnabled()
  const sequenceAssist = sequenceMode ? (assist as ReturnType<typeof useSequenceAssist>) : null
  const [dropTargetTrackId, setDropTargetTrackId] = useState<string | null>(null)
  const [blockPreview, setBlockPreview] = useState<{
    blockId: string
    left: number
    top: number
    dataUrl: string
  } | null>(null)
  const blockHoverTimerRef = useRef(0)
  const blockHoverTargetRef = useRef<string | null>(null)

  const clearBlockPreview = useCallback(() => {
    window.clearTimeout(blockHoverTimerRef.current)
    blockHoverTargetRef.current = null
    setBlockPreview(null)
  }, [])

  const handleClipPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, clip: TimelineClip) => {
      if (!sequenceAssist?.previewBlock) return
      blockHoverTargetRef.current = clip.id
      window.clearTimeout(blockHoverTimerRef.current)
      blockHoverTimerRef.current = window.setTimeout(() => {
        if (blockHoverTargetRef.current !== clip.id) return
        const snapshot = sequenceAssist.previewBlock(clip.id)
        if (!snapshot) return
        const dataUrl = snapshotThumbnailDataUrl(snapshot, 96)
        const rect = event.currentTarget.getBoundingClientRect()
        setBlockPreview({
          blockId: clip.id,
          left: rect.left + rect.width / 2,
          top: rect.top,
          dataUrl,
        })
      }, 500)
    },
    [sequenceAssist],
  )

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

  useEffect(() => {
    if (!sequenceMode || !sequenceAssist?.isNestedEdit) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        sequenceAssist.closeInnerEdit?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sequenceAssist, sequenceMode])

  useEffect(() => {
    if (!snapFlash) return
    const id = window.setTimeout(() => setSnapFlash(false), 120)
    return () => window.clearTimeout(id)
  }, [snapFlash])

  const handleClipPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, clip: TimelineClip, mode: 'move' | 'resize' = 'move') => {
      event.stopPropagation()
      sequenceAssist?.selectClip?.(clip.id, { additive: event.shiftKey })
      clipDragRef.current = {
        clipId: clip.id,
        originFrame: clip.startFrame,
        originTrackId: clip.trackId,
        startX: event.clientX,
        startY: event.clientY,
        trackHeight: TIMELINE_TRACK_HEIGHT,
        mode,
        originDurationFrames: clip.durationFrames,
        moved: mode === 'resize',
      }
      if (mode === 'resize') {
        assist.beginScrub()
        setDragClip({
          id: clip.id,
          trackId: clip.trackId,
          startFrame: clip.startFrame,
          durationFrames: clip.durationFrames,
        })
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    },
    [assist, sequenceAssist],
  )

  const handleClipPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = clipDragRef.current
      if (!drag) return

      const deltaX = event.clientX - drag.startX
      const deltaY = event.clientY - drag.startY
      if (!drag.moved && Math.hypot(deltaX, deltaY) > 4) {
        drag.moved = true
        assist.beginScrub()
        setDragClip({
          id: drag.clipId,
          trackId: drag.originTrackId,
          startFrame: drag.originFrame,
          durationFrames: drag.originDurationFrames,
        })
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId)
        }
      }

      if (!drag.moved || !event.currentTarget.hasPointerCapture(event.pointerId)) return

      const deltaFrames = Math.round(deltaX / assist.pixelsPerFrame)

      if (drag.mode === 'resize') {
        const nextDuration = Math.max(1, (drag.originDurationFrames ?? 1) + deltaFrames)
        setDragClip({
          id: drag.clipId,
          trackId: drag.originTrackId,
          startFrame: drag.originFrame,
          durationFrames: nextDuration,
        })
        return
      }

      const rawFrame = Math.max(0, drag.originFrame + deltaFrames)
      const nextTrackId = resolveTrackFromY(event.clientY)
      const snapped = sequenceAssist?.snapFrame?.(rawFrame, drag.clipId) ?? { frame: rawFrame, snapped: false }
      if (snapped.snapped) setSnapFlash(true)
      setDragClip({ id: drag.clipId, trackId: nextTrackId, startFrame: snapped.frame })
      setDropTargetTrackId(nextTrackId)
    },
    [assist, resolveTrackFromY, sequenceAssist],
  )

  const handleClipPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>, clip: TimelineClip) => {
      const drag = clipDragRef.current
      if (!drag || drag.clipId !== clip.id) return

      if (drag.moved) {
        if (drag.mode === 'resize' && sequenceAssist?.resizeHoldClip && dragClip) {
          sequenceAssist.resizeHoldClip(drag.clipId, dragClip.durationFrames ?? drag.originDurationFrames ?? 1)
        } else if (dragClip) {
          assist.moveClip(drag.clipId, dragClip.trackId, dragClip.startFrame)
        }
      } else {
        const now = Date.now()
        const last = clipTapRef.current
        if (last?.clipId === clip.id && now - last.time < 350) {
          if (clip.blockKind === 'sequence' || clip.blockKind === 'compound') {
            sequenceAssist?.openInnerClip?.(clip.id)
          }
          clipTapRef.current = null
        } else {
          clipTapRef.current = { clipId: clip.id, time: now }
        }
      }

      clipDragRef.current = null
      setDragClip(null)
      setDropTargetTrackId(null)
      assist.endScrub()
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    },
    [assist, dragClip, sequenceAssist],
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

  const renderClip = (
    clip: TimelineClip,
    opts?: { ghost?: boolean; dragging?: boolean },
  ) => {
    const drag = clipDragRef.current
    const isGhost = opts?.ghost
    const isDragging = opts?.dragging
    const active = isDragging && dragClip?.id === clip.id
    const frame =
      isGhost && drag
        ? drag.originFrame
        : active && dragClip
          ? dragClip.startFrame
          : clip.startFrame
    const trackId =
      isGhost && drag
        ? drag.originTrackId
        : active && dragClip
          ? dragClip.trackId
          : clip.trackId
    const durationFrames =
      active && dragClip?.durationFrames != null ? dragClip.durationFrames : clip.durationFrames
    const trackIndex = assist.trackIndexById.get(trackId) ?? -1
    if (trackIndex < 0) return null
    const left = timeline.frameToX(frame)
    const width = Math.max(assist.pixelsPerFrame * durationFrames, 18)
    const isSelected = sequenceAssist?.selectedBlockIds?.includes(clip.id)
    const isNestedClip = clip.blockKind === 'sequence' || clip.blockKind === 'compound'
    const isReferenceClip = clip.blockKind === 'reference'
    const tickCount = isNestedClip
      ? Math.min(clip.innerFrameCount ?? 0, 4 + (sequenceAssist?.blockZoomLevel ?? 1) * 4)
      : 0

    return (
      <div
        key={isGhost ? `${clip.id}-ghost` : clip.id}
        className={cn(
          'mas-clip mas-timeline__virtual-clip',
          isGhost && 'mas-timeline__clip--ghost',
          active && 'mas-clip--active mas-timeline__clip--dragging',
          active && snapFlash && 'mas-block--snapped',
          isSelected && !isGhost && 'mas-clip--selected',
          isNestedClip && clip.blockKind === 'sequence' && 'mas-timeline__clip--sequence',
          isNestedClip && clip.blockKind === 'compound' && 'mas-timeline__clip--compound',
          isReferenceClip && 'mas-timeline__clip--reference',
          frame === assist.currentFrame && !isGhost && 'mas-timeline__clip--playhead',
        )}
        style={{
          left,
          width,
          top: timelineTrackTop(trackIndex),
        }}
        data-testid="sequence-timeline-clip"
        data-block-id={clip.id}
        data-block-kind={clip.blockKind ?? 'hold'}
        onPointerDown={(event) => {
          if (isGhost || isDragging) return
          if ((event.target as HTMLElement).closest('.mas-clip__resize-handle')) return
          handleClipPointerDown(event, clip, 'move')
        }}
        onPointerEnter={!isGhost && sequenceMode ? (event) => handleClipPointerEnter(event, clip) : undefined}
        onPointerLeave={!isGhost && sequenceMode ? clearBlockPreview : undefined}
        onDoubleClick={(event) => {
          if (isGhost || !isNestedClip) return
          event.stopPropagation()
          sequenceAssist?.openInnerClip?.(clip.id)
        }}
        onPointerMove={!isGhost ? handleClipPointerMove : undefined}
        onPointerUp={!isGhost ? (event) => handleClipPointerUp(event, clip) : undefined}
        onPointerCancel={!isGhost ? (event) => handleClipPointerUp(event, clip) : undefined}
        role="group"
        aria-label={`${clip.label} at frame ${frame}`}
      >
        {clip.thumbUrl ? (
          <span className="mas-timeline__clip-thumb" style={{ backgroundImage: `url(${clip.thumbUrl})` }} />
        ) : (
          <span className="mas-timeline__clip-label">{clip.label}</span>
        )}
        {isNestedClip ? (
          <>
            <span className="mas-timeline__clip-badge" data-testid="sequence-clip-badge">
              {clip.blockKind === 'compound' ? 'CMP' : 'SEQ'}
            </span>
            {tickCount >= 4 ? (
              <span className="mas-timeline__clip-ticks" data-testid="sequence-clip-ticks" aria-hidden>
                {Array.from({ length: tickCount }, (_, i) => (
                  <span key={i} className="mas-timeline__clip-tick" />
                ))}
              </span>
            ) : null}
          </>
        ) : null}
        {sequenceMode && clip.blockKind === 'hold' ? (
          <span
            className="mas-clip__resize-handle"
            aria-label={`Stretch ${clip.label}`}
            onPointerDown={(event) => handleClipPointerDown(event, clip, 'resize')}
          />
        ) : null}
      </div>
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
    <StudioGlass className="mas-timeline" data-testid="sequence-timeline">
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
          <span className="mas-timeline__title">{panelTitle}</span>
          {sequenceMode ? <SequenceBreadcrumb /> : null}
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

            {visibleClips.flatMap((clip) => {
              if (dragClip?.id === clip.id && clipDragRef.current?.mode === 'move') {
                return [renderClip(clip, { ghost: true }), renderClip(clip, { dragging: true })]
              }
              if (dragClip?.id === clip.id) {
                return [renderClip(clip, { dragging: true })]
              }
              return [renderClip(clip)]
            })}

            {sequenceMode && assist.clips.length === 0 ? (
              <p className="mas-timeline__empty-hint" data-testid="sequence-timeline-empty">
                Paint on canvas to create your first hold clip
              </p>
            ) : null}
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
          {sequenceMode ? (
            <>
              <button
                type="button"
                className="mas-timeline__assist-btn"
                data-testid="sequence-split-btn"
                onClick={() => sequenceAssist?.splitSelectedAtPlayhead?.()}
              >
                Split
              </button>
              <button
                type="button"
                className="mas-timeline__assist-btn"
                data-testid="sequence-convert-btn"
                disabled={!sequenceAssist?.selectedBlockIds?.length}
                onClick={() => sequenceAssist?.convertSelectedToSequence?.()}
              >
                To Sequence
              </button>
              <button
                type="button"
                className="mas-timeline__assist-btn"
                data-testid="sequence-open-inner-btn"
                disabled={!sequenceAssist?.selectedBlockIds?.length}
                onClick={() => {
                  const id = sequenceAssist?.selectedBlockIds?.[0]
                  if (id) sequenceAssist?.openInnerClip?.(id)
                }}
              >
                Open
              </button>
              <button
                type="button"
                className="mas-timeline__assist-btn"
                data-testid="sequence-onion-toggle"
                onClick={() =>
                  sequenceAssist?.updateSettings?.({
                    onionSkinEnabled: !sequenceAssist.onionSkinEnabled,
                  })
                }
              >
                Onion
              </button>
              <button
                type="button"
                className="mas-timeline__assist-btn"
                data-testid="sequence-ripple-toggle"
                onClick={() =>
                  sequenceAssist?.updateSettings?.({
                    rippleDelete: !sequenceAssist.rippleDelete,
                  })
                }
              >
                Ripple
              </button>
            </>
          ) : null}
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

      {blockPreview && portalRoot
        ? createPortal(
            <div
              className="mas-block-preview"
              data-testid="sequence-block-preview"
              style={{ left: blockPreview.left, top: blockPreview.top }}
            >
              <img src={blockPreview.dataUrl} alt="" width={96} height={96} />
            </div>,
            portalRoot,
          )
        : null}
    </StudioGlass>
  )
}
