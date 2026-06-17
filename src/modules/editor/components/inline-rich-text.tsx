import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { cn } from '@/shared/lib/cn'

interface InlineRichTextProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  proseClassName?: string
  style?: React.CSSProperties
  contentStyle?: React.CSSProperties
}

function normalizeEditorHtml(html: string) {
  const trimmed = html.trim()
  if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>') return ''
  return trimmed
}

function canUseEditor(editor: Editor | null): editor is Editor {
  return Boolean(editor && !editor.isDestroyed && editor.view)
}

const STYLE_KEYS = [
  'color',
  'opacity',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'textDecoration',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'mixBlendMode',
  'WebkitTextStroke',
  'textShadow',
  'boxShadow',
  'filter',
  'WebkitMaskImage',
  'maskImage',
  'backgroundImage',
  'backgroundClip',
  'WebkitBackgroundClip',
  'backgroundSize',
  'backgroundColor',
  'transform',
  'textTransform',
  'transformOrigin',
  'transformStyle',
] as const

function applyContentStyle(el: HTMLElement, style?: React.CSSProperties) {
  for (const key of STYLE_KEYS) {
    const value = style?.[key]
    if (value == null || value === '') {
      el.style.removeProperty(key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`))
      continue
    }
    ;(el.style as unknown as Record<string, string>)[key] = String(value)
  }

  el.style.outline = 'none'
  el.style.minHeight = '1.5em'
}

export function InlineRichText({
  value,
  onChange,
  placeholder,
  className,
  proseClassName = 'prose prose-lg dark:prose-invert max-w-none font-serif',
  style,
  contentStyle,
}: InlineRichTextProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      if (ed.isDestroyed) return
      onChange(normalizeEditorHtml(ed.getHTML()))
    },
    editorProps: {
      attributes: {
        class: cn(proseClassName, 'focus:outline-none min-h-[1.5em]'),
      },
      handleKeyDown: (_view, event) => {
        event.stopPropagation()
        return false
      },
    },
  })

  useEffect(() => {
    if (!canUseEditor(editor)) return
    applyContentStyle(editor.view.dom as HTMLElement, contentStyle)
  }, [editor, contentStyle])

  useEffect(() => {
    if (!canUseEditor(editor)) return
    const activeEditor = editor
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled || !canUseEditor(activeEditor)) return
      try {
        const current = normalizeEditorHtml(activeEditor.getHTML())
        const next = normalizeEditorHtml(value)
        if (current !== next) {
          activeEditor.commands.setContent(next || '<p></p>', { emitUpdate: false })
        }
      } catch {
        // ignore teardown races
      }
    })
    return () => {
      cancelled = true
    }
  }, [editor, value])

  if (!canUseEditor(editor)) {
    return <div className={cn('min-h-[1.5em] text-muted-foreground', className)}>Loading…</div>
  }

  return (
    <div
      className={cn('article-inline-rich-text w-full', className)}
      style={style}
      onClick={() => editor.chain().focus().run()}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
