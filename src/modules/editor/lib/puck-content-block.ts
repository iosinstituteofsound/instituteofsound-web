import type { Data } from '@measured/puck'
import type { ArticlePuckComponents } from '@/modules/editor/lib/article-puck-config'
import { withPuckId } from '@/modules/editor/lib/puck-block-id'

export function puckContentBlock<T extends keyof ArticlePuckComponents>(
  type: T,
  props: ArticlePuckComponents[T],
): Data['content'][number] {
  return { type, props: withPuckId(props as Record<string, unknown>) } as Data['content'][number]
}
