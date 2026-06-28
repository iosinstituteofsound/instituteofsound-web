import { globalPluginRegistry, type PluginRegistry } from '@/modules/illustrator/lib/plugins/plugin-registry'
import { GifExportPlugin, WebmExportPlugin } from '@/modules/illustrator/lib/export/sequence-export-service'
import { AudioEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/audio-eval-node'
import { ConstraintsEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/constraints-eval-node'
import { FXEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/fx-eval-node'

let registered = false

export function registerBuiltinPlugins(registry: PluginRegistry = globalPluginRegistry): PluginRegistry {
  if (registered) return registry

  registry.registerEvalNode('eval:fx', 'FX Pass-through', () => new FXEvalNode())
  registry.registerEvalNode('eval:constraints', 'Constraints Pass-through', () => new ConstraintsEvalNode())
  registry.registerEvalNode('eval:audio', 'Audio Pass-through', () => new AudioEvalNode())
  registry.registerExporter('export:gif', 'GIF Export', () => new GifExportPlugin())
  registry.registerExporter('export:webm', 'WebM Export', () => new WebmExportPlugin())

  registered = true
  return registry
}

export function resetBuiltinPluginRegistration(): void {
  registered = false
}
