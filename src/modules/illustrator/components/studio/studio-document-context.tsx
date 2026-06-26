import { createContext, useContext } from 'react'
import type {
  StudioLayerPanelActions,
  StudioLayerPanelSnapshot,
} from '@/modules/illustrator/components/studio/studio-layer-panel.types'

export type StudioDocumentContextValue = {
  snapshot: StudioLayerPanelSnapshot
  actions: StudioLayerPanelActions
}

export const StudioDocumentContext = createContext<StudioDocumentContextValue | null>(null)

export function useStudioDocument() {
  return useContext(StudioDocumentContext)
}
