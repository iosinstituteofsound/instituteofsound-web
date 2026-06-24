import { Render, type Data } from '@measured/puck'
import { articlePuckConfig } from '@/modules/editor/lib/article-puck-config'

interface ArticlePuckRenderProps {
  data: Data
}

export function ArticlePuckRender({ data }: ArticlePuckRenderProps) {
  return <Render config={articlePuckConfig} data={data} />
}
