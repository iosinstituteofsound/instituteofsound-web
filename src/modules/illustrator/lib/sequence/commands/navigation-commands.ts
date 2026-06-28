import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import type { EditPathNode, SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export type PushEditPathPayload = {
  sequenceId: string
  blockId?: string
  zoomLevel?: number
}

export function createPushEditPathCommand(payload: PushEditPathPayload): SequenceCommand {
  let prevActiveId: string | null = null
  let prevPath: EditPathNode[] | null = null

  return {
    type: 'pushEditPath',
    execute(state) {
      prevActiveId = state.activeSequenceId
      prevPath = state.editPath
      const node: EditPathNode = {
        sequenceId: payload.sequenceId,
        blockId: payload.blockId,
        zoomLevel: payload.zoomLevel ?? 1,
      }
      return {
        ...state,
        activeSequenceId: payload.sequenceId,
        editPath: [...state.editPath, node],
      }
    },
    undo(state) {
      if (!prevActiveId || !prevPath) return state
      return {
        ...state,
        activeSequenceId: prevActiveId,
        editPath: prevPath,
      }
    },
  }
}

export function createPopEditPathCommand(): SequenceCommand {
  let prevActiveId: string | null = null
  let prevPath: SequenceState['editPath'] | null = null

  return {
    type: 'popEditPath',
    execute(state) {
      if (state.editPath.length <= 1) return state
      prevActiveId = state.activeSequenceId
      prevPath = state.editPath
      const nextPath = state.editPath.slice(0, -1)
      const parent = nextPath[nextPath.length - 1]
      return {
        ...state,
        activeSequenceId: parent.sequenceId,
        editPath: nextPath,
      }
    },
    undo(state) {
      if (!prevActiveId || !prevPath) return state
      return {
        ...state,
        activeSequenceId: prevActiveId,
        editPath: prevPath,
      }
    },
  }
}
