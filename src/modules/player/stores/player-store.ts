import { create } from 'zustand'
import { fisherYatesShuffle } from '@/modules/music/lib/player-queue'
import type { PlayTrackOptions, PlayerTrack, QueueSource, RepeatMode } from '@/modules/player/types/player.types'

interface PlayerState {
  currentTrack: PlayerTrack | null
  queue: PlayerTrack[]
  displayQueue: PlayerTrack[]
  queueIndex: number
  queueSource: QueueSource
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  isExpanded: boolean
  isBarOpen: boolean
  mobileView: 'mini' | 'sheet'
  isQueueOpen: boolean
  isPlaylistModalOpen: boolean
  isLyricsOpen: boolean
  isShuffling: boolean
  shuffleAnimationKey: number
  sessionReady: boolean
  playTrack: (track: PlayerTrack, options?: PlayTrackOptions) => void
  togglePlay: () => void
  pause: () => void
  play: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  shuffleQueueAnimated: () => Promise<void>
  commitShuffledQueue: (newQueue: PlayerTrack[]) => void
  cycleRepeat: () => void
  next: () => void
  previous: () => void
  addToQueue: (track: PlayerTrack) => void
  addToQueueNext: (track: PlayerTrack) => void
  removeFromQueue: (index: number) => void
  reorderQueue: (oldIndex: number, newIndex: number) => void
  playQueueIndex: (index: number) => void
  clearUpcoming: () => void
  openQueue: () => void
  closeQueue: () => void
  openPlaylistModal: () => void
  closePlaylistModal: () => void
  openLyrics: () => void
  closeLyrics: () => void
  toggleLyrics: () => void
  close: () => void
  setExpanded: (expanded: boolean) => void
  toggleBarOpen: () => void
  openBar: () => void
  closeBar: () => void
  openNowPlaying: () => void
  closeNowPlaying: () => void
  setPlaybackState: (state: Partial<Pick<PlayerState, 'currentTime' | 'duration' | 'isPlaying'>>) => void
}

function resolveQueueIndex(queue: PlayerTrack[], track: PlayerTrack, queueIndex?: number) {
  if (typeof queueIndex === 'number' && queueIndex >= 0 && queueIndex < queue.length) {
    return queueIndex
  }

  const found = queue.findIndex((entry) => entry.id === track.id)
  return found >= 0 ? found : 0
}

function pickNextIndex(state: Pick<PlayerState, 'queue' | 'queueIndex' | 'shuffle' | 'repeat'>) {
  if (state.queue.length <= 1) return state.queueIndex

  if (state.shuffle) {
    if (state.queue.length === 2) return state.queueIndex === 0 ? 1 : 0
    let next = state.queueIndex
    while (next === state.queueIndex) {
      next = Math.floor(Math.random() * state.queue.length)
    }
    return next
  }

  if (state.queueIndex < state.queue.length - 1) return state.queueIndex + 1
  return state.repeat === 'all' ? 0 : state.queueIndex
}

function pickPreviousIndex(state: Pick<PlayerState, 'queue' | 'queueIndex' | 'shuffle'>) {
  if (state.queue.length <= 1) return state.queueIndex

  if (state.shuffle) {
    if (state.queue.length === 2) return state.queueIndex === 0 ? 1 : 0
    let prev = state.queueIndex
    while (prev === state.queueIndex) {
      prev = Math.floor(Math.random() * state.queue.length)
    }
    return prev
  }

  return state.queueIndex > 0 ? state.queueIndex - 1 : 0
}

function computeShuffledQueue(queue: PlayerTrack[], currentTrack: PlayerTrack | null) {
  if (!currentTrack || queue.length <= 1) return fisherYatesShuffle(queue)
  const current = queue.find((t) => t.id === currentTrack.id)
  const rest = queue.filter((t) => t.id !== currentTrack.id)
  const shuffledRest = fisherYatesShuffle(rest)
  return current ? [current, ...shuffledRest] : shuffledRest
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
      currentTrack: null,
      queue: [],
      displayQueue: [],
      queueIndex: 0,
      queueSource: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.85,
      muted: false,
      shuffle: false,
      repeat: 'off',
      isExpanded: false,
      isBarOpen: false,
      mobileView: 'mini',
      isQueueOpen: false,
      isPlaylistModalOpen: false,
      isLyricsOpen: false,
      isShuffling: false,
      shuffleAnimationKey: 0,
      sessionReady: false,

      playTrack: (track, options) => {
        const queue = options?.queue?.length ? options.queue : [track]
        const queueIndex = resolveQueueIndex(queue, track, options?.queueIndex)

        set({
          currentTrack: track,
          queue,
          displayQueue: queue,
          queueIndex,
          queueSource: options?.queueSource ?? get().queueSource,
          isPlaying: options?.autoplay !== false,
          isBarOpen: false,
          currentTime: 0,
          duration: 0,
        })

      },

      togglePlay: () => set((state) => ({ isPlaying: state.currentTrack ? !state.isPlaying : false })),

      pause: () => set({ isPlaying: false }),

      play: () => set((state) => ({ isPlaying: Boolean(state.currentTrack) })),

      seek: (time) => set({ currentTime: Math.max(0, time) }),

      setVolume: (volume) =>
        set({
          volume: Math.min(1, Math.max(0, volume)),
          muted: volume <= 0,
        }),

      toggleMute: () => set((state) => ({ muted: !state.muted })),

      toggleShuffle: () => {
        const state = get()
        const nextShuffle = !state.shuffle
        set({ shuffle: nextShuffle })
        if (nextShuffle && state.queue.length > 1) {
          void get().shuffleQueueAnimated()
        }
      },

      shuffleQueueAnimated: async () => {
        const state = get()
        if (state.queue.length <= 1 || state.isShuffling) return

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const targetQueue = computeShuffledQueue(state.queue, state.currentTrack)

        if (prefersReducedMotion) {
          const newIndex = state.currentTrack
            ? targetQueue.findIndex((t) => t.id === state.currentTrack!.id)
            : 0
          set({
            queue: targetQueue,
            displayQueue: targetQueue,
            queueIndex: newIndex >= 0 ? newIndex : 0,
            shuffle: true,
          })
          return
        }

        set({
          isShuffling: true,
          displayQueue: [...state.queue],
          shuffleAnimationKey: state.shuffleAnimationKey + 1,
        })

        const rounds = Math.min(5, Math.max(3, Math.floor(state.queue.length / 2)))
        for (let round = 0; round < rounds; round += 1) {
          const current = get().displayQueue
          if (current.length < 2) break
          let a = Math.floor(Math.random() * current.length)
          let b = Math.floor(Math.random() * current.length)
          while (b === a) b = Math.floor(Math.random() * current.length)

          const nextDisplay = [...current]
          ;[nextDisplay[a], nextDisplay[b]] = [nextDisplay[b], nextDisplay[a]]
          set({ displayQueue: nextDisplay, shuffleAnimationKey: get().shuffleAnimationKey + 1 })
          await wait(180 + round * 40)
        }

        await wait(220)
        const newIndex = state.currentTrack
          ? targetQueue.findIndex((t) => t.id === state.currentTrack!.id)
          : 0

        set({
          queue: targetQueue,
          displayQueue: targetQueue,
          queueIndex: newIndex >= 0 ? newIndex : 0,
          shuffle: true,
          isShuffling: false,
        })
      },

      commitShuffledQueue: (newQueue) => {
        const state = get()
        const newIndex = state.currentTrack
          ? newQueue.findIndex((t) => t.id === state.currentTrack!.id)
          : 0
        set({
          queue: newQueue,
          displayQueue: newQueue,
          queueIndex: newIndex >= 0 ? newIndex : 0,
          isShuffling: false,
        })
      },

      cycleRepeat: () =>
        set((state) => {
          const order: RepeatMode[] = ['off', 'all', 'one']
          const index = order.indexOf(state.repeat)
          return { repeat: order[(index + 1) % order.length] }
        }),

      next: () => {
        const state = get()
        if (!state.currentTrack || state.queue.length === 0) return

        const nextIndex = pickNextIndex(state)
        const nextTrack = state.queue[nextIndex]
        if (!nextTrack) return

        set({
          currentTrack: nextTrack,
          queueIndex: nextIndex,
          isPlaying: true,
          currentTime: 0,
          duration: 0,
        })
      },

      previous: () => {
        const state = get()
        if (!state.currentTrack) return

        if (state.currentTime > 3) {
          set({ currentTime: 0 })
          return
        }

        if (state.queue.length <= 1) {
          set({ currentTime: 0 })
          return
        }

        const prevIndex = pickPreviousIndex(state)
        const prevTrack = state.queue[prevIndex]
        if (!prevTrack) return

        set({
          currentTrack: prevTrack,
          queueIndex: prevIndex,
          isPlaying: true,
          currentTime: 0,
          duration: 0,
        })
      },

      addToQueue: (track) => {
        const state = get()
        if (state.queue.some((t) => t.id === track.id)) return
        const queue = [...state.queue, track]
        set({ queue, displayQueue: queue })
      },

      addToQueueNext: (track) => {
        const state = get()
        if (state.queue.some((t) => t.id === track.id)) return
        const insertAt = state.queueIndex + 1
        const queue = [...state.queue]
        queue.splice(insertAt, 0, track)
        set({ queue, displayQueue: queue })
      },

      removeFromQueue: (index) => {
        const state = get()
        if (index < 0 || index >= state.queue.length) return
        const queue = state.queue.filter((_, i) => i !== index)
        let queueIndex = state.queueIndex
        if (index < state.queueIndex) queueIndex -= 1
        else if (index === state.queueIndex) {
          queueIndex = Math.min(queueIndex, Math.max(0, queue.length - 1))
          const nextTrack = queue[queueIndex] ?? null
          set({
            queue,
            displayQueue: queue,
            queueIndex,
            currentTrack: nextTrack,
            isPlaying: nextTrack ? state.isPlaying : false,
            currentTime: 0,
            duration: 0,
          })
          return
        }
        set({ queue, displayQueue: queue, queueIndex })
      },

      reorderQueue: (oldIndex, newIndex) => {
        const state = get()
        if (state.isShuffling) return
        if (oldIndex === newIndex) return
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= state.queue.length || newIndex >= state.queue.length) {
          return
        }

        const queue = [...state.queue]
        const [moved] = queue.splice(oldIndex, 1)
        if (!moved) return
        queue.splice(newIndex, 0, moved)

        const queueIndex = state.currentTrack
          ? queue.findIndex((track) => track.id === state.currentTrack!.id)
          : state.queueIndex

        set({
          queue,
          displayQueue: queue,
          queueIndex: queueIndex >= 0 ? queueIndex : 0,
        })
      },

      playQueueIndex: (index) => {
        const state = get()
        const track = state.queue[index]
        if (!track) return
        set({
          currentTrack: track,
          queueIndex: index,
          isPlaying: true,
          currentTime: 0,
          duration: 0,
        })
      },

      clearUpcoming: () => {
        const state = get()
        if (!state.currentTrack) return
        const queue = state.queue.slice(0, state.queueIndex + 1)
        set({ queue, displayQueue: queue })
      },

      openQueue: () => set({ isQueueOpen: true, isLyricsOpen: false }),
      closeQueue: () => set({ isQueueOpen: false }),

      openPlaylistModal: () => set({ isQueueOpen: true, isLyricsOpen: false }),

      closePlaylistModal: () => set({ isQueueOpen: false }),

      openLyrics: () => set({ isLyricsOpen: true, isQueueOpen: false }),

      closeLyrics: () => set({ isLyricsOpen: false }),

      toggleLyrics: () =>
        set((state) => ({
          isLyricsOpen: !state.isLyricsOpen,
          isQueueOpen: false,
        })),

      close: () =>
        set({
          currentTrack: null,
          queue: [],
          displayQueue: [],
          queueIndex: 0,
          queueSource: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isExpanded: false,
          isBarOpen: false,
          mobileView: 'mini',
          isQueueOpen: false,
          isPlaylistModalOpen: false,
          isLyricsOpen: false,
          isShuffling: false,
        }),

      setExpanded: (isExpanded) => set({ isExpanded }),

      toggleBarOpen: () => set((state) => ({ isBarOpen: state.currentTrack ? !state.isBarOpen : false })),

      openBar: () => set((state) => (state.currentTrack ? { isBarOpen: true } : { isBarOpen: false })),

      closeBar: () => set({ isBarOpen: false, isExpanded: false, mobileView: 'mini' }),

      openNowPlaying: () => set({ mobileView: 'sheet' }),

      closeNowPlaying: () => set({ mobileView: 'mini' }),

      setPlaybackState: (playback) => set(playback),
    }))

export function useActiveQueue() {
  const queue = usePlayerStore((s) => s.queue)
  const displayQueue = usePlayerStore((s) => s.displayQueue)
  const isShuffling = usePlayerStore((s) => s.isShuffling)
  return isShuffling && displayQueue.length ? displayQueue : queue
}
