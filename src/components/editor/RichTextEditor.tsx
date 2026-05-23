import { useEffect, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import clsx from 'clsx'
import { normalizeEditorHtml } from '@/lib/editorial/richText'

const ACCENT_COLORS = [
  { label: 'Signal', value: '#f5f5f5' },
  { label: 'Red', value: '#d40000' },
  { label: 'Crimson', value: '#8b1538' },
  { label: 'Muted', value: '#a3a3a3' },
  { label: 'Gold', value: '#ca8a04' },
]

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  id?: string
}

type ToolBtnProps = {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: ReactNode
}

function ToolBtn({ active, disabled, onClick, title, children }: ToolBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={clsx('ios-rte-btn', active && 'ios-rte-btn-active')}
    >
      {children}
    </button>
  )
}

function ToolSep() {
  return <span className="ios-rte-sep" aria-hidden />
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your editorial…',
  minHeight = '320px',
  id,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'ios-prose-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'ios-rte-editor-inner',
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(normalizeEditorHtml(ed.getHTML()))
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = normalizeEditorHtml(editor.getHTML())
    const next = normalizeEditorHtml(value)
    if (current !== next) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
  }, [editor, value])

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) {
    return (
      <div className="ios-rte-shell" style={{ minHeight }}>
        <p className="text-xs text-muted p-4">Loading editor…</p>
      </div>
    )
  }

  return (
    <div className="ios-rte-shell" style={{ ['--ios-rte-min-h' as string]: minHeight }}>
      <div className="ios-rte-toolbar" role="toolbar" aria-label="Text formatting">
        <ToolBtn
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolBtn>
        <ToolBtn
          title="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </ToolBtn>
        <ToolBtn
          title="Highlight"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          Hl
        </ToolBtn>

        <ToolSep />

        <ToolBtn
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolBtn>
        <ToolBtn
          title="Paragraph"
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          ¶
        </ToolBtn>

        <ToolSep />

        <ToolBtn
          title="Align left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ≡
        </ToolBtn>
        <ToolBtn
          title="Align center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ≡̂
        </ToolBtn>
        <ToolBtn
          title="Align right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ≡́
        </ToolBtn>

        <ToolSep />

        <ToolBtn
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolBtn>
        <ToolBtn
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolBtn>
        <ToolBtn
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          “
        </ToolBtn>
        <ToolBtn
          title="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          ↗
        </ToolBtn>

        <ToolSep />

        <div className="ios-rte-colors" role="group" aria-label="Text color">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              className="ios-rte-color-swatch"
              style={{ background: c.value }}
              onClick={() => editor.chain().focus().setColor(c.value).run()}
            />
          ))}
          <button
            type="button"
            title="Clear color"
            className="ios-rte-color-clear"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            ×
          </button>
        </div>

        <ToolSep />

        <ToolBtn
          title="Undo"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </ToolBtn>
        <ToolBtn
          title="Redo"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </ToolBtn>
        <ToolBtn
          title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          Clear
        </ToolBtn>
      </div>

      <EditorContent editor={editor} className="ios-rte-content" />
    </div>
  )
}
