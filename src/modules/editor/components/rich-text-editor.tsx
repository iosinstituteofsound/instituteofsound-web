import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

function normalizeEditorHtml(html: string) {
  const trimmed = html.trim()
  if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>') return ''
  return trimmed
}

function canUseEditor(editor: Editor | null): editor is Editor {
  return Boolean(editor && !editor.isDestroyed && editor.view)
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = '280px' }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Highlight,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write your editorial…' }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      if (ed.isDestroyed) return
      onChange(normalizeEditorHtml(ed.getHTML()))
    },
    editorProps: {
      attributes: {
        class:
          'rounded-md border border-border bg-background p-4 prose prose-sm dark:prose-invert max-w-none focus:outline-none',
        style: `min-height: ${minHeight}`,
      },
    },
  })

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
        // Editor can be mid-teardown during route/tab changes.
      }
    })

    return () => {
      cancelled = true
    }
  }, [editor, value])

  if (!canUseEditor(editor)) {
    return (
      <div
        className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground"
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    )
  }

  const activeEditor = editor

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {[
          {
            label: 'B',
            action: () => activeEditor.chain().focus().toggleBold().run(),
            active: activeEditor.isActive('bold'),
          },
          {
            label: 'I',
            action: () => activeEditor.chain().focus().toggleItalic().run(),
            active: activeEditor.isActive('italic'),
          },
          {
            label: 'U',
            action: () => activeEditor.chain().focus().toggleUnderline().run(),
            active: activeEditor.isActive('underline'),
          },
          {
            label: 'H2',
            action: () => activeEditor.chain().focus().toggleHeading({ level: 2 }).run(),
            active: activeEditor.isActive('heading', { level: 2 }),
          },
          {
            label: '•',
            action: () => activeEditor.chain().focus().toggleBulletList().run(),
            active: activeEditor.isActive('bulletList'),
          },
          {
            label: 'Link',
            action: () => {
              const url = window.prompt('URL')
              if (url) activeEditor.chain().focus().setLink({ href: url }).run()
            },
            active: activeEditor.isActive('link'),
          },
        ].map((tool) => (
          <Button
            key={tool.label}
            type="button"
            size="sm"
            variant="outline"
            className={cn('h-8 px-2', tool.active && 'bg-muted')}
            onClick={tool.action}
          >
            {tool.label}
          </Button>
        ))}
      </div>
      <EditorContent editor={activeEditor} />
    </div>
  )
}
