import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  Position,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react'
import { useQuery } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { CollectionNode } from '../components/graph_node_types'
import type { CollNodeType } from '../components/graph_node_types'
import {
  REL_TYPES,
  CreateRelationshipPanel,
  EditRelationshipPanel,
  type Relationship,
  type RelType,
} from '../components/RelationshipPanels'
import { useUserLayout } from '../lib/useUserLayout'

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
    h.push({ id: `h-top-${s}`,      type: 'target', position: Position.Top,    style: { left:   SLOT_PCT[s] } })
    h.push({ id: `h-right-${s}`,    type: 'source', position: Position.Right,  style: { top:    SLOT_PCT[s] } })
    h.push({ id: `h-right-t-${s}`,  type: 'target', position: Position.Right,  style: { top:    SLOT_PCT[s] } })
    h.push({ id: `h-bottom-${s}`,   type: 'source', position: Position.Bottom, style: { left:   SLOT_PCT[s] } })
    h.push({ id: `h-left-${s}`,     type: 'target', position: Position.Left,   style: { top:    SLOT_PCT[s] } })
    h.push({ id: `h-left-s-${s}`,   type: 'source', position: Position.Left,   style: { top:    SLOT_PCT[s] } })
  }
  return h
}

// ─── Inner graph (needs ReactFlow context for useReactFlow) ──────────────────

function RelationshipsFlow({
  collections,
  panel,
  setPanel,
  savedNodes,
  saveLayout,
  resetLayout,
}: {
  collections: Collection[]
  panel: PanelState
  setPanel: (p: PanelState) => void
  savedNodes: { id: string; x: number; y: number }[] | null
  saveLayout: (nodes: Node[]) => void
  resetLayout: () => void
}) {
  const rfInstance = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const closePanel = useCallback(() => setPanel(null), [setPanel])

  const onConnect = useCallback((connection: Connection) => {
    const srcId = connection.source ?? ''
    const tgtId = connection.target ?? ''
    if (!srcId.startsWith('col-') || !tgtId.startsWith('col-')) return
    setPanel({
      mode:      'create',
      sourceKey: srcId.replace(/^col-/, ''),
      targetKey: tgtId.replace(/^col-/, ''),
    })
  }, [setPanel])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const relData = edge.data as Relationship | undefined
    if (!relData) return
    setPanel({ mode: 'edit', rel: relData })
  }, [setPanel])

  const onNodeDragStop = useCallback(() => {
    // toObject() captures all current node positions from the live ReactFlow state
    const { nodes: currentNodes } = rfInstance.toObject()
    saveLayout(currentNodes)
  }, [rfInstance, saveLayout])

  // Build nodes + edges whenever collections or saved positions change
  useEffect(() => {
    const cols = collections ?? []

    const COLS       = Math.max(1, Math.ceil(Math.sqrt(cols.length)))
    const COL_STRIDE = 340
    const ROW_STRIDE = 280

    const gridPos = (i: number) => ({
      x: (i % COLS) * COL_STRIDE,
      y: Math.floor(i / COLS) * ROW_STRIDE,
    })

    // Build a lookup of server-saved positions
    const savedMap = new Map((savedNodes ?? []).map((n) => [n.id, { x: n.x, y: n.y }]))

    const rawNodes: Node[] = cols.map((col, i) => {
      const id = `col-${col.collection_key}`
      const pos = savedMap.get(id) ?? gridPos(i)
      return {
        id,
        type: 'collectionNode',
        data: {
          title:    col.title,
          collKey:  col.collection_key,
          isActive: false,
          handles:  makeHandles(),
        } satisfies CollNodeType['data'],
        position: pos,
      }
    })

    // Build position map for edge handle selection
    const posMap: Record<string, { x: number; y: number }> = {}
    rawNodes.forEach((n) => { posMap[n.id] = n.position })

    // Preserve positions of nodes the user has already moved in this session
    setNodes((current) => {
      const currentPosMap = new Map(current.map((n) => [n.id, n.position]))
      return rawNodes.map((n) => ({
        ...n,
        position: currentPosMap.get(n.id) ?? n.position,
      }))
    })

    const sideSlot: Record<string, number> = {}
    const nextSlot = (nodeId: string, side: string) => {
      const key = `${nodeId}::${side}`
      const s = (sideSlot[key] ?? 0) % SLOTS
      sideSlot[key] = s + 1
      return s
    }

    const pairIndex: Record<string, number> = {}
    const relEdges: BezierEdge[] = []

    for (const col of cols) {
      for (const rel of col.relationships ?? []) {
        const srcId   = `col-${rel.source_key ?? rel.source}`
        const tgtId   = `col-${rel.target_key ?? rel.target}`
        const pairKey = [srcId, tgtId].sort().join('||')
        const idx     = pairIndex[pairKey] ?? 0
        pairIndex[pairKey] = idx + 1

        const srcPos = posMap[srcId] ?? { x: 0, y: 0 }
        const tgtPos = posMap[tgtId] ?? { x: 0, y: 0 }

        const goRight   = srcPos.x <= tgtPos.x
        // Source must use a 'source'-type handle; target must use a 'target'-type handle.
        // Right handles are source-type; left handles are target-type.
        // For reverse-direction (source to the right), use the mirrored variants.
        const srcSide   = goRight ? 'right'   : 'left-s'
        const tgtSide   = goRight ? 'left'    : 'right-t'
        const srcHandle = `h-${srcSide}-${nextSlot(srcId, srcSide)}`
        const tgtHandle = `h-${tgtSide}-${nextSlot(tgtId, tgtSide)}`
        const curvature = 0.25 + idx * 0.15
        const visual    = REL_VISUAL[rel.type] ?? { color: '#71717a', labelBg: '#18181b' }

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
          style:               { stroke: visual.color, strokeWidth: 1.5, strokeDasharray: visual.dash, cursor: 'pointer' },
          type:        'default',
          pathOptions: { curvature },
          data:        rel,
        })
      }
    }

    setEdges(relEdges as Edge[])
  }, [collections, savedNodes, setNodes, setEdges])

  const activeRel    = panel?.mode === 'edit'   ? panel.rel : null
  const activeCreate = panel?.mode === 'create' ? panel     : null

  return (
    <>
      {collections.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ textAlign: 'center', color: '#52525b' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No collections yet</div>
            <div style={{ fontSize: 12 }}>Create Raptor Collections first, then return here to define relationships.</div>
          </div>
        </div>
      )}

      {collections.length > 0 && nodes.length > 0 && edges.length === 0 && (
        <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10, background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '8px 14px' }}>
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
        onNodeDragStop={onNodeDragStop}
        nodeTypes={NODE_TYPES}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
        <Controls position="top-right" style={{ marginTop: 8, marginRight: 16 }} />
        <SharedMiniMap />
        {savedNodes !== null && (
          <Panel position="bottom-left">
            <button
              onClick={resetLayout}
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #3f3f46', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}
            >
              Reset Layout
            </button>
          </Panel>
        )}
      </ReactFlow>

      {activeCreate && (
        <CreateRelationshipPanel
          sourceKey={activeCreate.sourceKey}
          targetKey={activeCreate.targetKey}
          collections={collections}
          onClose={closePanel}
        />
      )}
      {activeRel && (
        <EditRelationshipPanel
          rel={activeRel}
          collections={collections}
          onClose={closePanel}
        />
      )}
    </>
  )
}

// ─── Outer shell — owns data fetching and provides ReactFlow context ──────────

export default function CollectionsRelationshipsViewer() {
  const [panel, setPanel] = useState<PanelState>(null)
  const { savedNodes, saveLayout, resetLayout } = useUserLayout('collections-relationships')

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
  })

  return (
    <ReactFlowProvider>
      <RelationshipsFlow
        collections={collections}
        panel={panel}
        setPanel={setPanel}
        savedNodes={savedNodes}
        saveLayout={saveLayout}
        resetLayout={resetLayout}
      />
    </ReactFlowProvider>
  )
}
