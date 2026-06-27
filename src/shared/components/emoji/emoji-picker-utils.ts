export const EMOJI_PICKER_ROOT_SELECTOR = '[data-emoji-picker-root]'
export const EMOJI_TRIGGER_SELECTOR = '[data-emoji-trigger]'

export function isEmojiPickerTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(EMOJI_PICKER_ROOT_SELECTOR))
}

export function isEmojiTriggerTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(EMOJI_TRIGGER_SELECTOR))
}

/** Radix outside events expose the real target on detail.originalEvent. */
export function getRadixOutsideEventTarget(event: {
  target: EventTarget | null
  detail?: { originalEvent?: Event }
}) {
  return event.detail?.originalEvent?.target ?? event.target
}
