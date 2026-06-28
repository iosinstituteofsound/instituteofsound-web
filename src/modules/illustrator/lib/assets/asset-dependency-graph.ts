export type AssetNodeKind = 'project' | 'scene' | 'master' | 'drawing' | 'sequenceFile' | 'block'

export type AssetNode = {
  id: string
  kind: AssetNodeKind
}

export type AssetEdge = {
  from: string
  to: string
  kind: 'contains' | 'references' | 'uses'
}

/** Lifecycle graph — save, delete, GC. Not used for playback order. */
export class AssetDependencyGraph {
  private nodes = new Map<string, AssetNode>()
  private edges: AssetEdge[] = []

  addNode(node: AssetNode): void {
    this.nodes.set(node.id, node)
  }

  addEdge(edge: AssetEdge): void {
    this.edges.push(edge)
  }

  getInbound(nodeId: string): AssetEdge[] {
    return this.edges.filter((e) => e.to === nodeId)
  }

  getOutbound(nodeId: string): AssetEdge[] {
    return this.edges.filter((e) => e.from === nodeId)
  }

  /** Nodes that depend on nodeId (consumers) */
  getDependents(nodeId: string): string[] {
    return this.getInbound(nodeId).map((e) => e.from)
  }

  wouldDeleteImpact(nodeId: string): { dependents: string[]; count: number } {
    const dependents = this.getDependents(nodeId)
    return { dependents, count: dependents.length }
  }
}
