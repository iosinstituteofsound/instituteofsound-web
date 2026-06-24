import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import {
  audienceFriendIds,
  audienceNeedsFriendSelection,
  POST_AUDIENCE_OPTIONS,
  type PostAudienceSelection,
  type PostAudienceType,
} from '@/modules/feed/lib/post-audience'
import { PostAudienceFriendsPicker } from '@/modules/feed/components/post-audience-friends-picker'
import { cn } from '@/shared/lib/cn'

type AudienceView = 'options' | 'friends'

interface PostAudiencePickerProps {
  value: PostAudienceSelection
  onChange: (next: PostAudienceSelection) => void
  onDone: () => void
  setAsDefault: boolean
  onSetAsDefaultChange: (next: boolean) => void
}

export function PostAudiencePicker({
  value,
  onChange,
  onDone,
  setAsDefault,
  onSetAsDefaultChange,
}: PostAudiencePickerProps) {
  const [view, setView] = useState<AudienceView>('options')
  const [draftType, setDraftType] = useState<PostAudienceType>(value.type)

  useEffect(() => {
    setDraftType(value.type)
  }, [value.type])

  const draftAudience = useMemo<PostAudienceSelection>(
    () => ({
      type: draftType,
      excludedUserIds: value.excludedUserIds,
      includedUserIds: value.includedUserIds,
    }),
    [draftType, value.excludedUserIds, value.includedUserIds],
  )

  const friendMode = draftType === 'exclude' ? 'exclude' : 'include'
  const selectedFriendIds = audienceFriendIds(draftAudience)

  const handleSelectType = (type: PostAudienceType) => {
    setDraftType(type)
    if (audienceNeedsFriendSelection(type)) {
      setView('friends')
    }
  }

  const handleDone = () => {
    onChange({
      type: draftType,
      excludedUserIds: draftType === 'exclude' ? value.excludedUserIds : [],
      includedUserIds: draftType === 'include' ? value.includedUserIds : [],
    })
    onDone()
  }

  const canDone =
    !audienceNeedsFriendSelection(draftType) ||
    (draftType === 'exclude' ? value.excludedUserIds.length > 0 : value.includedUserIds.length > 0)

  return (
    <div className="feed-post-audience">
      <div
        className={cn(
          'feed-post-audience__track',
          view === 'friends' && 'feed-post-audience__track--friends',
        )}
      >
        <section className="feed-post-audience__panel feed-post-audience__panel--options">
          <div className="feed-post-audience__intro">
            <p className="feed-post-audience__question">Who can see your post?</p>
            <p className="feed-post-audience__caption">
              Your post will appear in Feed, on your profile and in search results.
            </p>
          </div>

          <div className="feed-post-audience__options" role="radiogroup" aria-label="Post audience">
            {POST_AUDIENCE_OPTIONS.map((option) => {
              const Icon = option.icon
              const selected = draftType === option.type
              const friendCount =
                option.type === 'exclude'
                  ? value.excludedUserIds.length
                  : option.type === 'include'
                    ? value.includedUserIds.length
                    : 0

              return (
                <button
                  key={option.type}
                  type="button"
                  role="radio"
                  aria-checked={selected ? 'true' : 'false'}
                  className={cn('feed-post-audience__option', selected && 'is-selected')}
                  onClick={() => handleSelectType(option.type)}
                >
                  <span className="feed-post-audience__option-icon" aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="feed-post-audience__option-copy">
                    <span className="feed-post-audience__option-label">{option.label}</span>
                    <span className="feed-post-audience__option-desc">{option.description}</span>
                    {option.actionLabel ? (
                      <span
                        className="feed-post-audience__option-action"
                        onClick={(event) => {
                          event.stopPropagation()
                          if (audienceNeedsFriendSelection(option.type)) {
                            setDraftType(option.type)
                            setView('friends')
                          }
                        }}
                      >
                        {friendCount > 0 ? `${friendCount} selected · Change` : option.actionLabel}
                      </span>
                    ) : null}
                  </span>
                  <span className={cn('feed-post-audience__radio', selected && 'is-checked')} aria-hidden />
                </button>
              )
            })}
          </div>

          <label className="feed-post-audience__default">
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(event) => onSetAsDefaultChange(event.target.checked)}
            />
            <span className="feed-post-audience__default-box" aria-hidden>
              {setAsDefault ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <span>Set as default audience</span>
          </label>

          <div className="feed-post-audience__footer">
            <button
              type="button"
              className={cn('feed-create-post__submit', !canDone && 'opacity-50')}
              disabled={!canDone}
              onClick={handleDone}
            >
              Done
            </button>
          </div>
        </section>

        <section className="feed-post-audience__panel feed-post-audience__panel--friends">
          <PostAudienceFriendsPicker
            mode={friendMode}
            selectedIds={selectedFriendIds}
            onBack={() => setView('options')}
            onChange={(ids) => {
              onChange({
                type: draftType,
                excludedUserIds: draftType === 'exclude' ? ids : value.excludedUserIds,
                includedUserIds: draftType === 'include' ? ids : value.includedUserIds,
              })
            }}
            onDone={() => setView('options')}
          />
        </section>
      </div>
    </div>
  )
}
