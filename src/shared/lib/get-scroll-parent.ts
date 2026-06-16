export type ScrollContainer = HTMLElement | Window

function isScrollableElement(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY

  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false
  }

  return element.scrollHeight > element.clientHeight + 1
}

/** Nearest ancestor that scrolls, or `window` when the page scrolls on the document. */
export function getScrollParent(element: HTMLElement | null): ScrollContainer {
  if (!element) return window

  let parent = element.parentElement

  while (parent) {
    if (isScrollableElement(parent)) {
      return parent
    }
    parent = parent.parentElement
  }

  return window
}

export function getScrollTop(container: ScrollContainer) {
  if (container === window) return window.scrollY
  return (container as HTMLElement).scrollTop
}

export function setScrollTop(container: ScrollContainer, value: number) {
  if (container === window) {
    window.scrollTo(0, value)
    return
  }

  ;(container as HTMLElement).scrollTop = value
}

export function resolveScrollContainerForIds(sectionIds: string[]): ScrollContainer {
  for (const id of sectionIds) {
    const element = document.getElementById(id)
    if (element) {
      return getScrollParent(element)
    }
  }

  return window
}
