export interface Text3dEffectState {
  presetId: string
  intensity: number
}

export const DEFAULT_TEXT_3D_EFFECT: Text3dEffectState = {
  presetId: '',
  intensity: 100,
}

export function hasText3dEffect(state: Text3dEffectState): boolean {
  return Boolean(state.presetId.trim() && state.presetId !== 'none')
}
