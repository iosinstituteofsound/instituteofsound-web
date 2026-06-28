export type RuntimeNodeKind = 'camera' | 'track' | 'constraint' | 'fx' | 'audio' | 'composite'

export type RuntimeNode = {
  id: string
  kind: RuntimeNodeKind
}

export type RuntimeEdge = {
  from: string
  to: string
  kind: 'dependsOn' | 'parents' | 'drives'
}

/** Playback eval order + dirty propagation. Separate from AssetDependencyGraph. */
export class RuntimeDependencyGraph {
  private nodes = new Map<string, RuntimeNode>()
  private edges: RuntimeEdge[] = []

  addNode(node: RuntimeNode): void {
    this.nodes.set(node.id, node)
  }

  addEdge(edge: RuntimeEdge): void {
    this.edges.push(edge)
  }

  /** Topological sort: dependencies before dependents */
  evaluationOrder(): string[] {
    const ids = [...this.nodes.keys()]
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      for (const edge of this.edges) {
        if (edge.from === id) visit(edge.to)
      }
      order.push(id)
    }

    for (const id of ids) visit(id)
    return order.reverse()
  }

  /** Downstream nodes that must re-eval when source is dirty */
  propagateDirty(sourceId: string): string[] {
    const result: string[] = []
    const queue = [sourceId]
    const seen = new Set<string>()

    while (queue.length) {
      const id = queue.shift()!
      if (seen.has(id)) continue
      seen.add(id)
      result.push(id)
      for (const edge of this.edges) {
        if (edge.to === id) queue.push(edge.from)
      }
    }
    return result
  }
}
