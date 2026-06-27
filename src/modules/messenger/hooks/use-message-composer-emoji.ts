import { useCallback, useState, type RefObject } from 'react'
import { insertAtCursor } from '@/shared/lib/emoji/animated-emoji'

export function useMessageComposerEmoji(
  setText: (value: string) => void,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const openPicker = useCallback(
    (anchor: HTMLElement) => {
      if (pickerOpen && anchorEl === anchor) {
        setPickerOpen(false)
        return
      }
      setAnchorEl(anchor)
      setPickerOpen(true)
    },
    [pickerOpen, anchorEl],
  )

  const insertEmoji = useCallback(
    (emoji: string) => {
      const node = textareaRef.current
      if (!node) return

      const start = node.selectionStart ?? node.value.length
      const end = node.selectionEnd ?? node.value.length
      const { nextValue, cursor } = insertAtCursor(node.value, emoji, start, end)
      setText(nextValue)
      setPickerOpen(false)

      requestAnimationFrame(() => {
        node.focus()
        node.setSelectionRange(cursor, cursor)
      })
    },
    [setText, textareaRef],
  )

  return {
    pickerOpen,
    anchorEl,
    openPicker,
    setPickerOpen,
    insertEmoji,
  }
}
