import type { Data } from '@measured/puck'
import { InlineImageBlock } from '@/modules/editor/components/inline-image-block'
import { InlineRichText } from '@/modules/editor/components/inline-rich-text'
import {
  ArticleCanvasSelection,
  type ResizeHandle,
} from '@/modules/editor/components/article-canvas-selection'
import {
  buildCanvasImageCss,
  buildCanvasTextContentCss,
  buildCanvasTextFrameCss,
} from '@/modules/editor/lib/canvas-style-to-css'
import { readText2dEffectFromStyle } from '@/modules/editor/lib/canvas-text-2d-effects-utils'
import { readText3dEffectFromStyle } from '@/modules/editor/lib/canvas-text-3d-effects-utils'
import { parseBlockLayout, parseBlockStyle } from '@/modules/editor/lib/canvas-block-utils'
import { beginPointerDrag } from '@/modules/editor/lib/canvas-pointer-drag'
import { hasText2dEffect } from '@/modules/editor/types/article-text-2d-effect.types'
import { hasText3dEffect } from '@/modules/editor/types/article-text-3d-effect.types'
import { useCanvasTextFit } from '@/modules/editor/hooks/use-canvas-text-fit'
import type { CanvasBlockLayout } from '@/modules/editor/types/article-canvas.types'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import { isImageCanvasBlock, isTextCanvasBlock, isAudioCanvasBlock, isVideoCanvasBlock } from '@/modules/editor/types/article-canvas.types'
import { ArticleSessionAudioPlayer } from '@/modules/editor/components/article-session-audio-player'
import { ArticleSessionVideoPlayer } from '@/modules/editor/components/article-session-video-player'
import { cn } from '@/shared/lib/cn'

interface ArticleCanvasBlockProps {
  block: Data['content'][number]
  blockId: string
  layoutOverride?: Partial<CanvasBlockLayout>
  selected: boolean
  showSelectionChrome: boolean
  dragging: boolean
  onSelect: (additive: boolean) => void
  onUpdate: (patch: Record<string, unknown>) => void
  onDelete: () => void
  onMoveStart: (clientX: number, clientY: number) => void
  onResizeStart: (handle: ResizeHandle, clientX: number, clientY: number) => void
  onRotateStart: (clientX: number, clientY: number) => void
  onInteractionPointerMove: (clientX: number, clientY: number) => void
  onInteractionPointerEnd: () => void
}

function isInteractiveCanvasTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      'button, input, textarea, select, a, label, [contenteditable], .ProseMirror, .article-inline-rich-text',
    ),
  )
}

const ALIGN_CLASS = {
  left: 'article-canvas-block__frame--align-left',
  center: 'article-canvas-block__frame--align-center',
  right: 'article-canvas-block__frame--align-right',
  justify: 'article-canvas-block__frame--align-justify',
} as const

export function ArticleCanvasBlock({
  block,
  blockId,
  layoutOverride,
  selected,
  showSelectionChrome,
  dragging,
  onSelect,
  onUpdate,
  onDelete,
  onMoveStart,
  onResizeStart,
  onRotateStart,
  onInteractionPointerMove,
  onInteractionPointerEnd,
}: ArticleCanvasBlockProps) {
  const type = block.type as CanvasBlockType
  const props = block.props as Record<string, unknown>
  const parsedLayout = parseBlockLayout(props.layout, type, 0)
  const layout = layoutOverride ? { ...parsedLayout, ...layoutOverride } : parsedLayout
  const style = parseBlockStyle(props.style)
  const isText = isTextCanvasBlock(type)
  const isImage = isImageCanvasBlock(type)
  const isAudio = isAudioCanvasBlock(type)
  const isVideo = isVideoCanvasBlock(type)
  const textFrameStyle = isText ? buildCanvasTextFrameCss(style) : {}
  const textContentStyle = isText ? buildCanvasTextContentCss(style) : {}
  const text2dState = readText2dEffectFromStyle(style)
  const text3dState = readText3dEffectFromStyle(style)
  const effectTransform =
    style.effects.transform && !hasText2dEffect(text2dState) && !hasText3dEffect(text3dState)
      ? 'skewX(-2deg)'
      : undefined
  const hugText = isText && layout.sizing !== 'fixed'
  const inkMetrics = useCanvasTextFit(type, props, style, isText)
  const imageCss = isImage ? buildCanvasImageCss(style) : null
  const resolvedLineHeight = style.lineSpacing ? 1 + style.lineSpacing / 100 : undefined

  const baseZIndex = layout.zIndex ?? 0

  const positionStyle = {
    left: `${layout.x}%`,
    top: `${layout.y}%`,
    zIndex: dragging ? baseZIndex + 10_000 : baseZIndex,
    transform: `rotate(${style.angle}deg)${effectTransform ? ` ${effectTransform}` : ''}`,
    width: isText ? `${layout.width}%` : hugText ? 'fit-content' : `${layout.width}%`,
    maxWidth: isText ? `${layout.width}%` : hugText ? `${layout.width}%` : undefined,
    display: layout.hidden ? 'none' : undefined,
    pointerEvents: layout.hidden ? 'none' : undefined,
    opacity: isText ? style.opacity / 100 : undefined,
    mixBlendMode: isText ? (style.blendMode === 'normal' ? undefined : style.blendMode) : undefined,
  } as React.CSSProperties

  const frameStyle = {
    ...textFrameStyle,
    '--block-max-width': `${layout.width}%`,
    ...(inkMetrics
      ? {
          '--text-pad-top': `${inkMetrics.paddingTop}px`,
          '--text-pad-right': `${inkMetrics.paddingRight}px`,
          '--text-pad-bottom': `${inkMetrics.paddingBottom}px`,
          '--text-pad-left': `${inkMetrics.paddingLeft}px`,
        }
      : {}),
  } as React.CSSProperties

  const textFieldStyle = inkMetrics
    ? {
        padding: `${inkMetrics.paddingTop}px ${inkMetrics.paddingRight}px ${inkMetrics.paddingBottom}px ${inkMetrics.paddingLeft}px`,
        minHeight: `${inkMetrics.minHeight + inkMetrics.paddingTop + inkMetrics.paddingBottom}px`,
        minWidth: `${inkMetrics.minWidth + inkMetrics.paddingLeft + inkMetrics.paddingRight}px`,
        lineHeight: resolvedLineHeight ?? ('normal' as const),
        boxSizing: 'border-box' as const,
        ...(style.textAlign === 'center'
          ? { marginLeft: 'auto', marginRight: 'auto' }
          : style.textAlign === 'right'
            ? { marginLeft: 'auto' }
            : {}),
      }
    : {
        lineHeight: resolvedLineHeight ?? ('normal' as const),
        boxSizing: 'border-box' as const,
      }

  return (
    <div
      data-block-id={blockId}
      className={cn(
        'article-canvas-block absolute',
        isText && 'article-canvas-block--text',
        isImage && 'article-canvas-block--image',
        isAudio && 'article-canvas-block--audio',
        isVideo && 'article-canvas-block--video',
        hugText && 'article-canvas-block--hug',
        selected && 'article-canvas-block--selected',
        selected && !showSelectionChrome && 'article-canvas-block--group-selected',
        dragging && 'article-canvas-block--dragging',
      )}
      style={positionStyle}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(e.shiftKey)
      }}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div
        className={cn(
          'article-canvas-block__frame',
          isText && ALIGN_CLASS[style.textAlign],
        )}
        style={frameStyle}
        onPointerDown={(e) => {
          if (isInteractiveCanvasTarget(e.target)) return
          if (selected && !showSelectionChrome) {
            beginPointerDrag(
              e,
              () => onMoveStart(e.clientX, e.clientY),
              (clientX, clientY) => onInteractionPointerMove(clientX, clientY),
              () => onInteractionPointerEnd(),
            )
            return
          }
          if (!showSelectionChrome) return
          beginPointerDrag(
            e,
            () => onMoveStart(e.clientX, e.clientY),
            (clientX, clientY) => onInteractionPointerMove(clientX, clientY),
            () => onInteractionPointerEnd(),
          )
        }}
      >
        {showSelectionChrome ? (
          <ArticleCanvasSelection
            onDelete={onDelete}
            onMoveStart={onMoveStart}
            onResizeStart={onResizeStart}
            onRotateStart={onRotateStart}
            onInteractionPointerMove={onInteractionPointerMove}
            onInteractionPointerEnd={onInteractionPointerEnd}
          />
        ) : null}

        <div className="article-canvas-block__content">
          {type === 'ArticleTitle' ? (
            <textarea
              value={(props.text as string) ?? ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Text"
              rows={1}
              className="article-canvas-block__auto-text"
              style={{ ...textContentStyle, textAlign: style.textAlign, ...textFieldStyle }}
            />
          ) : null}

          {(type === 'ArticleLead' || type === 'ArticleBody') && (
            <InlineRichText
              value={(props.body as string) ?? ''}
              onChange={(body) => onUpdate({ body })}
              placeholder="Text"
              className="article-canvas-block__rich-text"
              contentStyle={{ ...textContentStyle, textAlign: style.textAlign, ...textFieldStyle }}
              proseClassName="max-w-none focus:outline-none [&_.tiptap]:leading-normal [&_.tiptap]:p-0"
            />
          )}

          {type === 'ArticleSection' ? (
            <div className="article-canvas-block__section space-y-1">
              <input
                value={(props.heading as string) ?? ''}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Section"
                className="article-canvas-block__auto-text w-full bg-transparent font-bold placeholder:text-current/40 focus:outline-none"
                style={{ ...textContentStyle, fontWeight: 'bold', ...textFieldStyle }}
              />
              <InlineRichText
                value={(props.body as string) ?? ''}
                onChange={(body) => onUpdate({ body })}
                placeholder="Section body"
                className="article-canvas-block__rich-text"
                contentStyle={{ ...textContentStyle, ...textFieldStyle }}
                proseClassName="max-w-none [&_.tiptap]:leading-normal"
              />
            </div>
          ) : null}

          {(type === 'ArticleImage' || type === 'ArticleHero') && (
            <InlineImageBlock
              imageUrl={(props.imageUrl as string) ?? ''}
              onChange={(imageUrl) => onUpdate({ imageUrl })}
              aspect={type === 'ArticleHero' ? 'video' : 'auto'}
              wrapperStyle={imageCss?.wrapper}
              imgStyle={imageCss?.img}
              placeholderStyle={imageCss?.placeholder}
              interactive={false}
            />
          )}

          {type === 'ArticleAudio' ? (
            <div className={cn('article-canvas-audio-block w-full', !selected && 'pointer-events-none')}>
              {(props.audioUrl as string) ? (
                <ArticleSessionAudioPlayer
                  audioUrl={String(props.audioUrl)}
                  trackTitle={String(props.trackTitle ?? 'Session')}
                  sessionLabel={String(props.sessionLabel ?? 'Listen to the session')}
                  sessionTracks={
                    Array.isArray(props.sessionTracks)
                      ? (props.sessionTracks as import('@/modules/editor/lib/session-audio-tracks').SessionAudioTrack[])
                      : undefined
                  }
                  variant="compact"
                  interactive={selected}
                />
              ) : (
                <div className="article-canvas-audio-block__empty">Session audio</div>
              )}
            </div>
          ) : null}

          {type === 'ArticleVideo' ? (
            <div className={cn('article-canvas-video-block w-full', !selected && 'pointer-events-none')}>
              {(props.videoUrl as string) ? (
                <ArticleSessionVideoPlayer
                  videoUrl={String(props.videoUrl)}
                  videoTitle={String(props.videoTitle ?? 'Session video')}
                  caption={String(props.caption ?? 'Watch the session')}
                  posterUrl={typeof props.posterUrl === 'string' ? props.posterUrl : undefined}
                  interactive={selected}
                />
              ) : (
                <div className="article-canvas-video-block__empty">Session video</div>
              )}
            </div>
          ) : null}

          {type === 'ArticleDivider' ? <hr className="border-current/40" /> : null}
        </div>
      </div>
    </div>
  )
}
