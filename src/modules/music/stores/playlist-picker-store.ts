import { create } from 'zustand'

export type PlaylistPickerTrack = {
  trackId: string
  title: string
  artist?: string
  artworkUrl?: string
}

interface PlaylistPickerState {
  isOpen: boolean
  track: PlaylistPickerTrack | null
  open: (track: PlaylistPickerTrack) => void
  close: () => void
}

export const usePlaylistPickerStore = create<PlaylistPickerState>((set) => ({
  isOpen: false,
  track: null,
  open: (track) => set({ isOpen: true, track }),
  close: () => set({ isOpen: false, track: null }),
}))
