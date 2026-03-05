import Dagre from '@dagrejs/dagre'
import { type Node, type Edge } from '@xyflow/react'

export const NODE_DIMS: Record<string, { w: number; h: number }> = {
  extensionNode:        { w: 160, h: 95 },
  collectionsGroupNode:  { w: 110, h: 68 },
  collectionNode:       { w: 180, h: 70 },
  fieldsNode:           { w: 110, h: 90 },
}

export function layoutWithDagre(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 60 })

  nodes.forEach((n) => {
    const { w, h } = NODE_DIMS[n.type ?? ''] ?? { w: 160, h: 50 }
    g.setNode(n.id, { width: w, height: h })
  })
  edges.forEach((e) => g.setEdge(e.source, e.target))

  Dagre.layout(g)

  const layouted = nodes.map((n) => {
    const pos = g.node(n.id)
    const { w, h } = NODE_DIMS[n.type ?? ''] ?? { w: 160, h: 50 }
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } }
  })

  return layouted
}
