import { useState } from 'react'
import clsx from 'clsx'
import type { ArtistSocialLinks } from '@/lib/artist-profile/types'
import {
  getOrderedSocialLinks,
  moveSocialLinkOrder,
  reorderActiveSocialLinks,
  reorderSocialLinkByDrag,
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
  const [dragKey, setDragKey] = useState<SocialLinkKey | null>(null)
  const [overKey, setOverKey] = useState<SocialLinkKey | null>(null)

  if (active.length < 2) {
    return (
      <p className="text-xs text-muted">
        Do ya zyada links bharo — phir order change kar sakte ho.
      </p>
    )
  }

  const activeKeys = active.map((a) => a.key)

  const commitActiveOrder = (keys: SocialLinkKey[]) => {
    onOrderChange(reorderActiveSocialLinks(order, keys))
  }

  const handleDrop = (targetKey: SocialLinkKey) => {
    if (!dragKey) return
    commitActiveOrder(reorderSocialLinkByDrag(activeKeys, dragKey, targetKey))
    setDragKey(null)
    setOverKey(null)
  }

  return (
    <div className="space-y-2">
      <FieldLabel>Link order (public page)</FieldLabel>
      <p className="text-xs text-muted mb-3">
        Drag karke order set karo — ya ↑ ↓ buttons. Jo link upar, woh pehle dikhega.
      </p>
      <ul className="space-y-2" role="list">
        {active.map((item, index) => {
          const isDragging = dragKey === item.key
          const isOver = overKey === item.key && dragKey !== item.key

          return (
            <li
              key={item.key}
              draggable
              onDragStart={() => setDragKey(item.key)}
              onDragEnd={() => {
                setDragKey(null)
                setOverKey(null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setOverKey(item.key)
              }}
              onDragLeave={() => {
                if (overKey === item.key) setOverKey(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(item.key)
              }}
              className={clsx(
                'artist-social-order-row flex items-center gap-2 border px-3 py-2 transition-colors',
                isDragging && 'artist-social-order-row-dragging',
                isOver && 'artist-social-order-row-over'
              )}
            >
              <span
                className="artist-social-order-handle cursor-grab active:cursor-grabbing"
                aria-hidden
                title="Drag to reorder"
              >
                ⋮⋮
              </span>
              <span className="text-[10px] font-mono text-muted w-5">{index + 1}</span>
              <span className="flex-1 text-sm font-medium">{SOCIAL_LINK_META[item.key].label}</span>
              <div className="flex gap-1 shrink-0">
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
          )
        })}
      </ul>
    </div>
  )
}
