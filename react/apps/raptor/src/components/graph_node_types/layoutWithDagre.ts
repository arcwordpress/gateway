import Dagre from '@dagrejs/dagre'
import { type Node, type Edge } from '@xyflow/react'

export const NODE_DIMS: Record<string, { w: number; h: number }> = {
  siteNode:      { w: 180, h: 100 },
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
const H_GAP      = 80    // gap between extension right edge and first collection
const COLL_GAP   = 100   // gap between adjacent collections — wide enough for relationship edge labels
const ROW_GAP    = 60    // vertical gap between extension rows
const COLL_DY    = 70    // how much lower collections start vs extension top (below ext mid-point)

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

// ─── Collections dagre layout ─────────────────────────────────────────────────
// Extension node: upper-left of its group.
// Collections: horizontal row directly below, left-aligned with the extension.

const _EXT_W        = 200
const _EXT_H        = 140
const _COLL_W       = 200
const _COLL_H       = 180
const _COLL_H_GAP   = 40   // horizontal gap between adjacent collections
const _EXT_COLL_GAP = 80   // horizontal gap between extension right edge and first collection
const _GROUP_GAP    = 60   // vertical gap between extension groups
const _COLL_DY      = 100  // how far below the extension's top edge the collection row starts;
                            // must exceed _EXT_H/2 so the extension's right handle clears the
                            // collection tops and edges can route straight across instead of
                            // going up and around the collection node bodies

export function layoutCollectionsDagre(nodes: Node[], edges: Edge[]): Node[] {
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
        x: _EXT_W + _EXT_COLL_GAP + i * (_COLL_W + _COLL_H_GAP),
        y: currentY + _COLL_DY,
      }
    }

    const rowH = Math.max(_EXT_H, collIds.length > 0 ? _COLL_H + _COLL_DY : _EXT_H)
    currentY += rowH + _GROUP_GAP
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
