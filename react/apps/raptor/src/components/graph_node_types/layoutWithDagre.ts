import Dagre from '@dagrejs/dagre'
import { type Node, type Edge } from '@xyflow/react'

export const NODE_DIMS: Record<string, { w: number; h: number }> = {
  extensionNode: { w: 200, h: 130 },
  collectionNode: { w: 200, h: 160 },
}

// ─── Collections LR layout ───────────────────────────────────────────────────
// Extensions in a vertical column on the left, each extension's collections
// in a horizontal row to the right, with collections starting slightly lower
// than the extension's top edge for a clean ordered-list appearance.

const EXT_W      = 200
const EXT_H      = 140   // rough estimate
const COLL_W     = 200
const COLL_H     = 180   // rough estimate (taller with fields list)
const H_GAP      = 60    // gap between extension right edge and first collection
const COLL_GAP   = 20    // gap between adjacent collections in a row
const ROW_GAP    = 40    // vertical gap between extension rows
const COLL_DY    = 12    // how much lower collections start vs extension top

export function layoutCollectionsLR(nodes: Node[], edges: Edge[]): Node[] {
  // Map each extension → its collection node IDs (in edge order)
  const extToColls: Record<string, string[]> = {}
  edges.forEach((e) => {
    if (!extToColls[e.source]) extToColls[e.source] = []
    extToColls[e.source].push(e.target)
  })

  const extNodes = nodes.filter((n) => n.type === 'extensionNode')
  const positions: Record<string, { x: number; y: number }> = {}

  let currentY = 0
  for (const ext of extNodes) {
    positions[ext.id] = { x: 0, y: currentY }

    const collIds = extToColls[ext.id] ?? []
    for (let i = 0; i < collIds.length; i++) {
      positions[collIds[i]] = {
        x: EXT_W + H_GAP + i * (COLL_W + COLL_GAP),
        y: currentY + COLL_DY,
      }
    }

    const rowH = Math.max(EXT_H, collIds.length > 0 ? COLL_H + COLL_DY : EXT_H)
    currentY += rowH + ROW_GAP
  }

  return nodes.map((n) => ({ ...n, position: positions[n.id] ?? n.position }))
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
