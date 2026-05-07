import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
  type ReactFlowInstance,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant, Panel } from '@xyflow/react'
import { JsonSchemaProp, RecordsStatus, RecordsCtxValue, RecordsCtx, FIELD_GRAPH_NODE_TYPES, AdminCollectionInfo } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import { Field } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'
import { useApp } from '../../context/app'
import { useCollection, useFields } from './FieldsPageContext'
import { useUserLayout } from '../../lib/useUserLayout'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recordLabel(record: Record<string, unknown>): string {
  const skipKeys = new Set(['id', 'created_at', 'updated_at', 'deleted_at'])
  for (const [k, v] of Object.entries(record)) {
    if (skipKeys.has(k)) continue
    if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 40)
    if (typeof v === 'number') return String(v)
  }
  return `ID ${record['id'] ?? '?'}`
}

function fieldsToSchemaProps(fields: Field[]): JsonSchemaProp[] {
  return fields.map(f => {
    let type    = 'string'
    let format: string | undefined

    switch (f.type) {
      case 'number':
        type = 'number'; break
      case 'integer':
        type = 'integer'; break
      case 'boolean':
      case 'checkbox':
        type = 'boolean'; break
      case 'date':
      case 'date-picker':
        format = 'date'; break
      case 'datetime':
      case 'datetime-local':
        format = 'date-time'; break
      case 'email':
        format = 'email'; break
      case 'url':
        format = 'uri'; break
      case 'file':
      case 'image':
        format = 'uri'; break
      case 'select':
      case 'radio':
      case 'text':
      case 'textarea':
      default:
        break
    }

    return { name: f.name, type, format, required: false }
  })
}

// Left panel: left-4 (16px) + w-96 (384px) — permanently visible, so fitView must avoid it
const LEFT_PANEL_RIGHT_EDGE = 400

// ─── Graph component ──────────────────────────────────────────────────────────

export function Graph() {
  const { shellTopOffset } = useApp()
  const { collection } = useCollection()
  const { fields }     = useFields()
  const collKey = collection?.collection_key ?? ''
  const routeKey = collKey ? `collections-${collKey}-fields` : 'collections-unknown-fields'
  const { savedNodes, saveLayout, resetLayout } = useUserLayout(routeKey)
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const flowRef = useRef<ReactFlowInstance | null>(null)
  const [_graphHeightPx, setGraphHeightPx] = useState(480)

  const fitToVisibleArea = useCallback(() => {
    const instance = flowRef.current
    const container = graphContainerRef.current
    if (!instance || !container) return

    const nodes = instance.getNodes()
    if (nodes.length === 0) return

    const cw = container.clientWidth
    const ch = container.clientHeight

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const node of nodes) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = (node as any).measured?.width ?? 200
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h = (node as any).measured?.height ?? 80
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + w)
      maxY = Math.max(maxY, node.position.y + h)
    }

    if (!isFinite(minX)) return

    const PAD = 40
    const availW = cw - LEFT_PANEL_RIGHT_EDGE - PAD * 2
    const availH = ch - PAD * 2
    const contentW = maxX - minX
    const contentH = maxY - minY

    const zoom = Math.min(
      availW / Math.max(contentW, 1),
      availH / Math.max(contentH, 1),
      2,
    )

    const x = LEFT_PANEL_RIGHT_EDGE + PAD + (availW - contentW * zoom) / 2 - minX * zoom
    const y = PAD + (availH - contentH * zoom) / 2 - minY * zoom

    instance.setViewport({ x, y, zoom }, { duration: 0 })
  }, [])

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    flowRef.current = instance
    setTimeout(fitToVisibleArea, 50)
  }, [fitToVisibleArea])

  const { data: adminData } = useQuery<AdminCollectionInfo | null>({
    queryKey: ['admin-data-collection', collKey],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) return null
      const json = await res.json() as { collections?: AdminCollectionInfo[] }
      return json.collections?.find(c => c.key === collKey) ?? null
    },
    enabled: !!collKey,
  })

  const getManyRoute = adminData?.routes.find(r => r.type === 'get_many')?.route ?? null

  const [fetchTrigger, setFetchTrigger] = useState(1)
  const { data: recordsData, isFetching: recordsFetching } = useQuery<Record<string, unknown>[]>({
    queryKey: ['collection-recent-records', collKey, fetchTrigger],
    queryFn: async () => {
      const url = apiUrl(`${getManyRoute}?per_page=5&order_by=id&order=desc`)
      const res = await fetch(url, { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json() as { data?: { items?: Record<string, unknown>[] } }
      return json.data?.items ?? []
    },
    enabled: fetchTrigger > 0 && !!getManyRoute,
    staleTime: Infinity,
  })

  const handleRefresh = useCallback(() => {
    setFetchTrigger(t => t + 1)
  }, [])

  const tableName     = adminData?.table ?? (collKey ? `wp_gateway_${collKey}` : 'Unknown')
  const recentRecords = recordsData ?? []
  const schemaProps   = fieldsToSchemaProps(fields)

  const recordsStatus: RecordsStatus =
    !getManyRoute                  ? 'no-route' :
    recordsFetching                ? 'loading'  :
    fetchTrigger === 0             ? 'idle'      :
    recentRecords.length === 0     ? 'empty'     : 'loaded'

  const ROOT_X       = 200
  const DB_X         = 0
  const SCHEMA_X     = 380
  const RECORDS_X    = 10

  const RECORD_SPACING   = 140
  const slicedRecords    = recentRecords.slice(0, 5)
  const totalRecordWidth = slicedRecords.length * RECORD_SPACING
  const recordStartX     = RECORDS_X - totalRecordWidth / 2 + RECORD_SPACING / 2

  const buildNodes = (): Node[] => {
    const defaults: Node[] = [
      {
        id: '1',
        type: 'collectionRootNode',
        data: { title: collection?.title ?? collKey, collKey },
        position: { x: ROOT_X, y: 0 },
      },
      {
        id: 'node-db-table',
        type: 'databaseNode',
        data: { tableName, recordCount: adminData?.record_count ?? null },
        position: { x: DB_X, y: 160 },
      },
      {
        id: 'node-schema',
        type: 'jsonSchemaNode',
        data: { title: collection?.title ?? collKey, properties: schemaProps },
        position: { x: SCHEMA_X, y: 160 },
      },
      {
        id: 'node-records',
        type: 'recordsContainerNode',
        data: { count: recentRecords.length },
        position: { x: RECORDS_X, y: 320 },
      },
      ...slicedRecords.map((rec, i) => ({
        id: `record-${rec['id'] ?? i}`,
        type: 'recordNode' as const,
        data: {
          recordId: (rec['id'] as number | string) ?? i + 1,
          label: recordLabel(rec),
        },
        position: { x: recordStartX + i * RECORD_SPACING, y: 480 },
      })),
    ]

    return defaults.map((n) => {
      const saved = savedNodes?.find((s) => s.id === n.id)
      return saved ? { ...n, position: { x: saved.x, y: saved.y } } : n
    })
  }

  const computedEdges: Edge[] = [
    { id: 'e-root-db',     source: '1',             target: 'node-db-table' },
    { id: 'e-root-schema', source: '1',              target: 'node-schema'   },
    { id: 'e-db-records',  source: 'node-db-table', target: 'node-records'  },
    ...slicedRecords.map((rec, i) => ({
      id: `e-records-r${i}`,
      source: 'node-records',
      target: `record-${rec['id'] ?? i}`,
    })),
  ]

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(buildNodes())
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(buildNodes()) }, [adminData, recordsData, collection, fields, savedNodes])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [adminData, recordsData])                                 // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, _node: Node, allNodes: Node[]) => {
      saveLayout(allNodes)
    },
    [saveLayout],
  )

  const recordsCtxValue: RecordsCtxValue = { status: recordsStatus, count: recentRecords.length, onRefresh: handleRefresh }

  useEffect(() => {
    const updateGraphHeight = () => {
      const el = graphContainerRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      const available = Math.max(window.innerHeight - Math.max(top, shellTopOffset), 320)
      setGraphHeightPx(available)
    }

    updateGraphHeight()
    window.addEventListener('resize', updateGraphHeight)

    const scrollParent = graphContainerRef.current?.closest('.overflow-y-auto')
    const onScroll = () => updateGraphHeight()
    if (scrollParent) scrollParent.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('resize', updateGraphHeight)
      if (scrollParent) scrollParent.removeEventListener('scroll', onScroll)
    }
  }, [shellTopOffset])

  return (
    <RecordsCtx.Provider value={recordsCtxValue}>
      <div ref={graphContainerRef} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={graphNodes}
          edges={graphEdges}
          nodeTypes={FIELD_GRAPH_NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onInit={handleInit}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
          <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} onFitView={fitToVisibleArea} />
          <SharedMiniMap />
          {savedNodes !== null && (
            <Panel position="bottom-left">
              <button
                onClick={resetLayout}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  borderRadius: 6,
                  border: '1px solid #3f3f46',
                  background: 'transparent',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                }}
              >
                Reset Layout
              </button>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </RecordsCtx.Provider>
  )
}
