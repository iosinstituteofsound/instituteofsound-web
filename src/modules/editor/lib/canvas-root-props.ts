import type { Data } from '@measured/puck'

export function cloneCanvasRootProps(data: Data): Record<string, unknown> {
  return { ...((data.root?.props as Record<string, unknown> | undefined) ?? {}) }
}

export function withCanvasRootProps(data: Data, props: Record<string, unknown>): Data {
  return {
    ...data,
    root: {
      ...data.root,
      props: props as Data['root']['props'],
    },
  }
}
