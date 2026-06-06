import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  Position,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react'
import { useQuery } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { CollectionNode } from '../components/graph_node_types'
import type { CollNodeType } from '../components/graph_node_types'
import { useUserLayout } from '../lib/useUserLayout'

// ─── Types ──────────────────────────────────────────────────────────────────

type RelType = 'HasMany' | 'BelongsTo' | 'HasOne' | 'BelongsToMany'

type Relationship = {
  name: string
  type: RelType
  target_key: string
}

type Collection = {
  key: string
  title: string
  relationships?: Relationship[]
}

// ─── Per-type visual config ───────────────────────────────────────────────────

const REL_VISUAL: Record<RelType, { color: string; dash?: string; labelBg: string; label: string }> = {
  BelongsTo:     { color: '#f59e0b',               labelBg: '#431407', label: 'BelongsTo' },
  HasMany:       { color: '#60a5fa', dash: '7 4',  labelBg: '#172554', label: 'HasMany' },
  HasOne:        { color: '#34d399', dash: '2 3',  labelBg: '#064e3b', label: 'HasOne' },
  BelongsToMany: { color: '#c084fc', dash: '10 3 2 3', labelBg: '#3b0764', label: 'BelongsToMany' },
}

type BezierEdge = Edge & { pathOptions?: { curvature?: number } }

// ─── Node type registry ──────────────────────────────────────────────────────

const NODE_TYPES: NodeTypes = {
  collectionNode: CollectionNode as React.ComponentType<any>,
}

// ─── Handle slot config ───────────────────────────────────────────────────────

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

// ─── Inner graph ─────────────────────────────────────────────────────────────

function RelationshipsFlow({
  collections,
  savedNodes,
  saveLayout,
  resetLayout,
}: {
  collections: Collection[]
  savedNodes: { id: string; x: number; y: number }[] | null
  saveLayout: (nodes: Node[]) => void
  resetLayout: () => void
}) {
  const rfInstance = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const onNodeDragStop = useCallback(() => {
    const { nodes: currentNodes } = rfInstance.toObject()
    saveLayout(currentNodes)
  }, [rfInstance, saveLayout])

  useEffect(() => {
    const cols = collections ?? []

    const COLS       = Math.max(1, Math.ceil(Math.sqrt(cols.length)))
    const COL_STRIDE = 340
    const ROW_STRIDE = 280

    const gridPos = (i: number) => ({
      x: (i % COLS) * COL_STRIDE,
      y: Math.floor(i / COLS) * ROW_STRIDE,
    })

    const savedMap = new Map((savedNodes ?? []).map((n) => [n.id, { x: n.x, y: n.y }]))

    const rawNodes: Node[] = cols.map((col, i) => {
      const id = `col-${col.key}`
      const pos = savedMap.get(id) ?? gridPos(i)
      return {
        id,
        type: 'collectionNode',
        data: {
          title:    col.title,
          collKey:  col.key,
          isActive: false,
          handles:  makeHandles(),
        } satisfies CollNodeType['data'],
        position: pos,
      }
    })

    const posMap: Record<string, { x: number; y: number }> = {}
    rawNodes.forEach((n) => { posMap[n.id] = n.position })

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
        const srcId   = `col-${col.key}`
        const tgtId   = `col-${rel.target_key}`
        const pairKey = [srcId, tgtId].sort().join('||')
        const idx     = pairIndex[pairKey] ?? 0
        pairIndex[pairKey] = idx + 1

        const srcPos = posMap[srcId] ?? { x: 0, y: 0 }
        const tgtPos = posMap[tgtId] ?? { x: 0, y: 0 }

        const goRight   = srcPos.x <= tgtPos.x
        const srcSide   = goRight ? 'right'   : 'left-s'
        const tgtSide   = goRight ? 'left'    : 'right-t'
        const srcHandle = `h-${srcSide}-${nextSlot(srcId, srcSide)}`
        const tgtHandle = `h-${tgtSide}-${nextSlot(tgtId, tgtSide)}`
        const curvature = 0.25 + idx * 0.15
        const visual    = REL_VISUAL[rel.type] ?? { color: '#71717a', labelBg: '#18181b', label: rel.type }

        relEdges.push({
          id:                  `rel-${col.key}-${rel.name}`,
          source:              srcId,
          target:              tgtId,
          sourceHandle:        srcHandle,
          targetHandle:        tgtHandle,
          label:               rel.name,
          labelStyle:          { fill: visual.color, fontSize: 10, fontWeight: 600 },
          labelBgStyle:        { fill: visual.labelBg, fillOpacity: 0.9 },
          labelBgPadding:      [5, 3] as [number, number],
          labelBgBorderRadius: 4,
          style:               { stroke: visual.color, strokeWidth: 1.5, strokeDasharray: visual.dash, cursor: 'default' },
          type:                'default',
          pathOptions:         { curvature },
        })
      }
    }

    setEdges(relEdges as Edge[])
  }, [collections, savedNodes, setNodes, setEdges])

  return (
    <>
      {collections.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ textAlign: 'center', color: '#52525b' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No collections registered</div>
          </div>
        </div>
      )}

      {collections.length > 0 && nodes.length > 0 && edges.length === 0 && (
        <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10, background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '8px 14px' }}>
          <div style={{ fontSize: 11, color: '#71717a', textAlign: 'center' }}>
            No relationships defined on registered collections.
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={NODE_TYPES}
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
    </>
  )
}

// ─── Outer shell ─────────────────────────────────────────────────────────────

export default function CollectionsRelationshipsViewer() {
  const { savedNodes, saveLayout, resetLayout } = useUserLayout('collections-relationships')

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['registered-collections-with-rels'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/collections?include_private=true'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return Array.isArray(json) ? json : (json.collections ?? [])
    },
    staleTime: 30_000,
  })

  return (
    <ReactFlowProvider>
      <RelationshipsFlow
        collections={collections}
        savedNodes={savedNodes}
        saveLayout={saveLayout}
        resetLayout={resetLayout}
      />
    </ReactFlowProvider>
  )
}
