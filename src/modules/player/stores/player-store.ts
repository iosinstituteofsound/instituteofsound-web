import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlayTrackOptions, PlayerTrack, RepeatMode } from '@/modules/player/types/player.types'

interface PlayerState {
  currentTrack: PlayerTrack | null
  queue: PlayerTrack[]
  queueIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  isExpanded: boolean
  playTrack: (track: PlayerTrack, options?: PlayTrackOptions) => void
  togglePlay: () => void
  pause: () => void
  play: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  next: () => void
  previous: () => void
  close: () => void
  setExpanded: (expanded: boolean) => void
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

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.85,
      muted: false,
      shuffle: false,
      repeat: 'off',
      isExpanded: false,

      playTrack: (track, options) => {
        const queue = options?.queue?.length ? options.queue : [track]
        const queueIndex = resolveQueueIndex(queue, track, options?.queueIndex)

        set({
          currentTrack: track,
          queue,
          queueIndex,
          isPlaying: options?.autoplay !== false,
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

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

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

      close: () =>
        set({
          currentTrack: null,
          queue: [],
          queueIndex: 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isExpanded: false,
        }),

      setExpanded: (isExpanded) => set({ isExpanded }),

      setPlaybackState: (playback) => set(playback),
    }),
    {
      name: 'ios-player',
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
    },
  ),
)
