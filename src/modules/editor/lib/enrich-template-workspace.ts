import type { Data } from '@measured/puck'
import { extractCoverUrl, extractGalleryUrls } from '@/modules/editor/lib/puck-to-html'

function demoImg(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/ios-template-${seed}/${w}/${h}`
}

function cloneContent(content: Data['content']): Data['content'] {
  return JSON.parse(JSON.stringify(content)) as Data['content']
}

function countImageBlocks(content: Data['content']): number {
  return content.filter((block) => block.type === 'ArticleHero' || block.type === 'ArticleImage').length
}

/** Match modal preview: inject demo hero / section images when puck has none. */
export function enrichTemplatePuckForWorkspace(
  puck: Data,
  templateId: string,
  category: string,
): Data {
  const content = cloneContent(puck.content)
  const coverUrl = extractCoverUrl(puck)
  const gallery = extractGalleryUrls(puck)
  const hasUsableImage = Boolean(coverUrl || gallery.length)

  const titleIdx = content.findIndex((block) => block.type === 'ArticleTitle')
  const insertAfterTitle = titleIdx >= 0 ? titleIdx + 1 : 0

  if (!hasUsableImage) {
    content.splice(insertAfterTitle, 0, {
      type: 'ArticleHero',
      props: {
        imageUrl: demoImg(templateId, 1400, 900),
        caption:
          templateId === 'system-blank'
            ? 'Add your hero image — replace via sidebar'
            : 'Hero image — replace in sidebar',
      },
    })
  } else if (!content.some((block) => block.type === 'ArticleHero') && coverUrl) {
    content.splice(insertAfterTitle, 0, {
      type: 'ArticleHero',
      props: {
        imageUrl: coverUrl,
        caption: '',
      },
    })
  }

  const minImages: Record<string, number> = {
    photo: 3,
    feature: 2,
    review: 2,
    interview: 2,
  }
  const min = templateId === 'system-blank' ? 1 : (minImages[category] ?? 1)

  let extra = 0
  while (countImageBlocks(content) < min) {
    const leadIdx = content.findIndex((block) => block.type === 'ArticleLead')
    const insertAt = leadIdx >= 0 ? leadIdx + 1 + extra : content.length
    content.splice(insertAt, 0, {
      type: 'ArticleImage',
      props: {
        imageUrl: demoImg(`${templateId}-section-${extra}`, 1200, 900),
        caption: `Section image ${extra + 1}`,
      },
    })
    extra += 1
  }

  return { ...puck, content }
}
