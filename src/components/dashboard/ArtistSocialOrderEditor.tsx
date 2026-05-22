import type { ArtistSocialLinks } from '@/lib/artist-profile/types'
import {
  getOrderedSocialLinks,
  moveSocialLinkOrder,
  SOCIAL_LINK_META,
  type SocialLinkKey,
} from '@/lib/artist-profile/socialOrder'
import { FieldLabel } from '@/components/ui/Input'

interface ArtistSocialOrderEditorProps {
  social: ArtistSocialLinks
  order: SocialLinkKey[]
  onOrderChange: (order: SocialLinkKey[]) => void
}

export function ArtistSocialOrderEditor({
  social,
  order,
  onOrderChange,
}: ArtistSocialOrderEditorProps) {
  const active = getOrderedSocialLinks(social, order)

  if (active.length < 2) {
    return (
      <p className="text-xs text-muted">
        Do ya zyada links bharo — phir order change kar sakte ho.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <FieldLabel>Link order (public page)</FieldLabel>
      <p className="text-xs text-muted mb-3">
        ↑ ↓ se decide karo kaunsa link pehle dikhe — link-in-bio jaisa.
      </p>
      <ul className="space-y-2">
        {active.map((item, index) => (
          <li
            key={item.key}
            className="flex items-center gap-2 border border-border/80 bg-surface/50 px-3 py-2"
          >
            <span className="text-[10px] font-mono text-muted w-5">{index + 1}</span>
            <span className="flex-1 text-sm font-medium">{SOCIAL_LINK_META[item.key].label}</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="artist-social-order-btn"
                disabled={index === 0}
                onClick={() => onOrderChange(moveSocialLinkOrder(order, item.key, 'up'))}
                aria-label={`Move ${item.label} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className="artist-social-order-btn"
                disabled={index === active.length - 1}
                onClick={() => onOrderChange(moveSocialLinkOrder(order, item.key, 'down'))}
                aria-label={`Move ${item.label} down`}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
