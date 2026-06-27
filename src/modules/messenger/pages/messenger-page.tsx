import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConversationPanel } from '@/modules/messenger/components/conversation-panel'
import { ThreadInfoPanel } from '@/modules/messenger/components/thread-info-panel'
import { ThreadSidebar } from '@/modules/messenger/components/thread-sidebar'
import { useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger.css'

export function MessengerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeThreadId = useMessengerUiStore((s) => s.activeThreadId)
  const setActiveThreadId = useMessengerUiStore((s) => s.setActiveThreadId)
  const showInfoPanel = useMessengerUiStore((s) => s.showInfoPanel)
  const { threads } = useMessengerThreads()

  useEffect(() => {
    const threadFromUrl = searchParams.get('t')
    const userFromUrl = searchParams.get('u')
    if (threadFromUrl) {
      setActiveThreadId(threadFromUrl)
      return
    }
    if (userFromUrl) {
      void messengerApi.createThread(userFromUrl).then((thread) => {
        setActiveThreadId(thread.threadId)
        setSearchParams({ t: thread.threadId }, { replace: true })
      })
    }
  }, [searchParams, setActiveThreadId, setSearchParams])

  useEffect(() => {
    if (!activeThreadId) return
    setSearchParams({ t: activeThreadId }, { replace: true })
  }, [activeThreadId, setSearchParams])

  const activeThread = useMemo(
    () => threads.find((thread) => thread.threadId === activeThreadId) ?? null,
    [activeThreadId, threads],
  )

  return (
    <div className="messenger-page mx-auto w-full max-w-[1600px] px-3 md:px-4">
      <div className="messenger-shell">
        <ThreadSidebar
          activeThreadId={activeThreadId}
          className={cn(activeThreadId && 'is-hidden-mobile')}
        />
        <ConversationPanel
          thread={activeThread}
          className={cn('messenger-panel', !activeThreadId && 'is-hidden-mobile')}
        />
        {showInfoPanel ? <ThreadInfoPanel thread={activeThread} /> : null}
      </div>
    </div>
  )
}
