import type { EvalNode } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'
import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import type { ExportPlugin } from '@/modules/illustrator/lib/export/export.types'

export type PluginKind = 'evalNode' | 'command' | 'blockType' | 'exporter'

export type PluginDescriptor = {
  id: string
  kind: PluginKind
  label: string
}

export type EvalNodePluginFactory = () => EvalNode

export type CommandPluginFactory = () => SequenceCommand

export type ExportPluginFactory = () => ExportPlugin

export class PluginRegistry {
  private evalNodes = new Map<string, EvalNodePluginFactory>()
  private commands = new Map<string, CommandPluginFactory>()
  private exporters = new Map<string, ExportPluginFactory>()
  private descriptors: PluginDescriptor[] = []

  registerEvalNode(id: string, label: string, factory: EvalNodePluginFactory): void {
    this.evalNodes.set(id, factory)
    this.descriptors.push({ id, kind: 'evalNode', label })
  }

  registerCommand(id: string, label: string, factory: CommandPluginFactory): void {
    this.commands.set(id, factory)
    this.descriptors.push({ id, kind: 'command', label })
  }

  registerExporter(id: string, label: string, factory: ExportPluginFactory): void {
    this.exporters.set(id, factory)
    this.descriptors.push({ id, kind: 'exporter', label })
  }

  createEvalNode(id: string): EvalNode | null {
    return this.evalNodes.get(id)?.() ?? null
  }

  createCommand(id: string): SequenceCommand | null {
    return this.commands.get(id)?.() ?? null
  }

  createExporter(id: string): ExportPlugin | null {
    return this.exporters.get(id)?.() ?? null
  }

  list(): readonly PluginDescriptor[] {
    return this.descriptors
  }
}

export const globalPluginRegistry = new PluginRegistry()
