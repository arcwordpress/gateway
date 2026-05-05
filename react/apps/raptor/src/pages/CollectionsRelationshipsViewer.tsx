import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import { useQuery } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { CollectionNode } from '../components/graph_node_types'
import type { NodeTypes } from '@xyflow/react'
import type { CollNodeType } from '../components/graph_node_types'
import {
  REL_TYPES,
  CreateRelationshipPanel,
  EditRelationshipPanel,
  type Relationship,
  type RelType,
} from '../components/RelationshipPanels'

// ─── Per-type visual config ───────────────────────────────────────────────────

const REL_VISUAL: Record<RelType, { color: string; dash?: string; labelBg: string }> = {
  belongsTo:     { color: '#f59e0b',               labelBg: '#431407' },  // amber  – solid
  hasMany:       { color: '#60a5fa', dash: '7 4',  labelBg: '#172554' },  // blue   – long dash
  hasOne:        { color: '#34d399', dash: '2 3',  labelBg: '#064e3b' },  // emerald– dotted
  belongsToMany: { color: '#c084fc', dash: '10 3 2 3', labelBg: '#3b0764' }, // purple – dash-dot
}

// pathOptions is a React Flow runtime prop for bezier edges but isn't in the
// base Edge type — extend locally and cast when passing to setEdges.
type BezierEdge = Edge & { pathOptions?: { curvature?: number } }

// ─── Types ──────────────────────────────────────────────────────────────────

type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  extension_id: number | null
  relationships: Relationship[] | null
}

type PanelState =
  | { mode: 'create'; sourceKey: string; targetKey: string }
  | { mode: 'edit';   rel: Relationship }
  | null


// ─── Node type registry (only collectionNode needed here) ────────────────────

const NODE_TYPES: NodeTypes = {
  collectionNode: CollectionNode as React.ComponentType<any>,
}

// ─── Handle slot config ───────────────────────────────────────────────────────

// Number of independent attachment points per side.
// Edges are distributed round-robin so they fan out instead of stacking.
const SLOTS = 5
const SLOT_PCT = ['15%', '30%', '50%', '70%', '85%']

function makeHandles() {
  const h: CollNodeType['data']['handles'] = []
  for (let s = 0; s < SLOTS; s++) {
    h.push({ id: `h-top-${s}`,    type: 'target', position: Position.Top,    style: { left:   SLOT_PCT[s] } })
    h.push({ id: `h-right-${s}`,  type: 'source', position: Position.Right,  style: { top:    SLOT_PCT[s] } })
    h.push({ id: `h-bottom-${s}`, type: 'source', position: Position.Bottom, style: { left:   SLOT_PCT[s] } })
    h.push({ id: `h-left-${s}`,   type: 'target', position: Position.Left,   style: { top:    SLOT_PCT[s] } })
  }
  return h
}

// ─── Main viewer ─────────────────────────────────────────────────────────────

export default function CollectionsRelationshipsViewer() {
  const [panel, setPanel] = useState<PanelState>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const rememberedPositions = useRef<Map<string, { x: number; y: number }>>(new Map())

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
  })

  const closePanel = useCallback(() => setPanel(null), [])

  const onConnect = useCallback((connection: Connection) => {
    const srcId = connection.source ?? ''
    const tgtId = connection.target ?? ''
    if (!srcId.startsWith('col-') || !tgtId.startsWith('col-')) return
    setPanel({
      mode:      'create',
      sourceKey: srcId.replace(/^col-/, ''),
      targetKey: tgtId.replace(/^col-/, ''),
    })
  }, [])

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      // Edge ids are `rel-{relId}`, data is embedded in edge.data
      const relData = edge.data as Relationship | undefined
      if (!relData) return
      setPanel({ mode: 'edit', rel: relData })
    },
    [],
  )

  // Build nodes + edges whenever collections change
  useEffect(() => {
    const cols = collections ?? []

    // Grid layout: square-ish grid with enough horizontal space for edge labels
    const COLS      = Math.max(1, Math.ceil(Math.sqrt(cols.length)))
    const COL_STRIDE = 340   // 200px node + 140px gap for edge labels
    const ROW_STRIDE = 280   // 200px node height estimate + 80px gap

    const gridPos = (i: number) => ({
      x: (i % COLS) * COL_STRIDE,
      y: Math.floor(i / COLS) * ROW_STRIDE,
    })

    const rawNodes: Node[] = cols.map((col, i) => ({
      id:       `col-${col.collection_key}`,
      type:     'collectionNode',
      data:     {
        title:    col.title,
        collKey:  col.collection_key,
        isActive: false,
        handles:  makeHandles(),
      } satisfies CollNodeType['data'],
      position: gridPos(i),
    }))

    // Build position map for handle selection (use remembered positions if user moved nodes)
    const posMap: Record<string, { x: number; y: number }> = {}
    rawNodes.forEach((n) => {
      posMap[n.id] = rememberedPositions.current.get(n.id) ?? n.position
    })

    setNodes((current) => {
      current.forEach((n) => rememberedPositions.current.set(n.id, n.position))
      return rawNodes.map((n) => ({
        ...n,
        position: rememberedPositions.current.get(n.id) ?? n.position,
      }))
    })

    // Per-node, per-side slot counter — edges are distributed round-robin so
    // they spread across the side instead of all exiting the same point.
    const sideSlot: Record<string, number> = {}
    const nextSlot = (nodeId: string, side: string) => {
      const key = `${nodeId}::${side}`
      const s = (sideSlot[key] ?? 0) % SLOTS
      sideSlot[key] = s + 1
      return s
    }

    // Pair index for curvature staggering (same two nodes → arc further out)
    const pairIndex: Record<string, number> = {}

    const relEdges: BezierEdge[] = []
    for (const col of cols) {
      for (const rel of col.relationships ?? []) {
        const srcId  = `col-${rel.source}`
        const tgtId  = `col-${rel.target}`
        const pairKey = [rel.source, rel.target].sort().join('||')
        const idx    = pairIndex[pairKey] ?? 0
        pairIndex[pairKey] = idx + 1

        const srcPos = posMap[srcId] ?? { x: 0, y: 0 }
        const tgtPos = posMap[tgtId] ?? { x: 0, y: 0 }

        // Pick exit/entry side based on relative position, then claim a slot
        const goRight = srcPos.x <= tgtPos.x
        const srcSide = goRight ? 'right' : 'left'
        const tgtSide = goRight ? 'left'  : 'right'
        const srcHandle = `h-${srcSide}-${nextSlot(srcId, srcSide)}`
        const tgtHandle = `h-${tgtSide}-${nextSlot(tgtId, tgtSide)}`

        // Stagger curvature for same-pair edges so they arc apart
        const curvature = 0.25 + idx * 0.15

        const visual = REL_VISUAL[rel.type] ?? { color: '#71717a', labelBg: '#18181b' }

        relEdges.push({
          id:                  `rel-${rel.id}`,
          source:              srcId,
          target:              tgtId,
          sourceHandle:        srcHandle,
          targetHandle:        tgtHandle,
          label:               REL_TYPES.find((r) => r.value === rel.type)?.label ?? rel.type,
          labelStyle:          { fill: visual.color, fontSize: 10, fontWeight: 600 },
          labelBgStyle:        { fill: visual.labelBg, fillOpacity: 0.9 },
          labelBgPadding:      [5, 3] as [number, number],
          labelBgBorderRadius: 4,
          style:               {
            stroke:          visual.color,
            strokeWidth:     1.5,
            strokeDasharray: visual.dash,
            cursor:          'pointer',
          },
          type:        'default',
          pathOptions: { curvature },
          data:        rel,
        })
      }
    }

    setEdges(relEdges as Edge[])
  }, [collections, setNodes, setEdges])

  const activeRel = panel?.mode === 'edit' ? panel.rel : null
  const activeCreate = panel?.mode === 'create' ? panel : null

  return (
    <>
      {/* Hint overlay */}
      {(collections ?? []).length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center', color: '#52525b' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No collections yet</div>
            <div style={{ fontSize: 12 }}>Create Raptor Collections first, then return here to define relationships.</div>
          </div>
        </div>
      )}

      {(collections ?? []).length > 0 && nodes.length > 0 && edges.length === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 10,
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 8,
            padding: '8px 14px',
          }}
        >
          <div style={{ fontSize: 11, color: '#71717a', textAlign: 'center' }}>
            Drag a connector from one collection node to another to create a relationship
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={NODE_TYPES}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
        <Controls position="top-right" style={{ marginTop: 8, marginRight: 16 }} />
        <SharedMiniMap />
      </ReactFlow>

      {activeCreate && (
        <CreateRelationshipPanel
          sourceKey={activeCreate.sourceKey}
          targetKey={activeCreate.targetKey}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
      {activeRel && (
        <EditRelationshipPanel
          rel={activeRel}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
    </>
  )
}
