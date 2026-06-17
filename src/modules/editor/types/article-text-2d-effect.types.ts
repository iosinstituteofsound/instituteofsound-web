export interface Text2dEffectState {
  presetId: string
  intensity: number
}

export const DEFAULT_TEXT_2D_EFFECT: Text2dEffectState = {
  presetId: '',
  intensity: 100,
}

export function hasText2dEffect(state: Text2dEffectState): boolean {
  return Boolean(state.presetId.trim() && state.presetId !== 'none')
}
