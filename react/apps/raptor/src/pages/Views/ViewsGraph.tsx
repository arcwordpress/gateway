import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import { useNavigate } from '@tanstack/react-router'
import { FIELD_GRAPH_NODE_TYPES, RecordsCtx, RecordsCtxValue, RecordsStatus, AdminCollectionInfo } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import { apiUrl, authHeaders } from '../../lib/api'
import { useCollection, useViews } from './ViewsPageContext'
import { Field, View } from '../../lib/object_types'

function toSchemaProps(columns: string[]) {
  return columns.map((name) => ({ name, type: 'string', required: false }))
}

function normalizeColumns(view: View, fields: Field[]): string[] {
  const byName = new Map(fields.map((f) => [f.name, f.name]))
  const byNameLower = new Map(fields.map((f) => [f.name.toLowerCase(), f.name]))
  const byLabel = new Map(fields.map((f) => [f.label, f.name]))
  const byLabelLower = new Map(fields.map((f) => [f.label.toLowerCase(), f.name]))

  const resolve = (raw: string): string => {
    const trimmed = raw.trim()
    if (!trimmed) return ''

    if (byName.has(trimmed)) return byName.get(trimmed) as string
    if (byNameLower.has(trimmed.toLowerCase())) return byNameLower.get(trimmed.toLowerCase()) as string
    if (byLabel.has(trimmed)) return byLabel.get(trimmed) as string
    if (byLabelLower.has(trimmed.toLowerCase())) return byLabelLower.get(trimmed.toLowerCase()) as string

    const normalized = trimmed.toLowerCase().replace(/\s+/g, '_')
    if (byNameLower.has(normalized)) return byNameLower.get(normalized) as string

    return trimmed
  }

  // Respect explicit per-view settings: if columns is an array (even empty),
  // use it exactly. Only fallback when columns is missing/undefined.
  if (Array.isArray(view.columns)) {
    const normalized = view.columns.map(resolve).filter(Boolean)
    return Array.from(new Set(normalized))
  }

  return fields.map((f) => f.name)
}

function getRowValue(row: Record<string, unknown>, column: string): unknown {
  if (column in row) return row[column]

  const lookup = column.toLowerCase()
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase() === lookup) return value
  }

  return undefined
}

export function Graph() {
  const { collection } = useCollection()
  const { views } = useViews()
  const navigate = useNavigate()
  const collKey = collection?.collection_key ?? ''

  const allFields = collection?.field_list?.fields ?? []

  // Track which views are expanded
  const [expandedViews, setExpandedViews] = useState<Set<string>>(new Set())

  const toggleView = useCallback((viewKey: string) => {
    setExpandedViews(prev => {
      const next = new Set(prev)
      if (next.has(viewKey)) {
        next.delete(viewKey)
      } else {
        next.add(viewKey)
      }
      return next
    })
  }, [])

  const { data: adminData } = useQuery<AdminCollectionInfo | null>({
    queryKey: ['admin-data-collection', collKey],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) return null
      const json = await res.json() as { collections?: AdminCollectionInfo[] }
      return json.collections?.find(c => c.key === collKey) ?? null
    },
    enabled: !!collKey,
    staleTime: 30_000,
  })

  const getManyRoute = adminData?.routes.find(r => r.type === 'get_many')?.route ?? null

  const [fetchTrigger, setFetchTrigger] = useState(1)
  const { data: recordsData, isFetching: recordsFetching } = useQuery<Record<string, unknown>[]>({
    queryKey: ['view-preview-records', collKey, fetchTrigger],
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

  const recentRecords = recordsData ?? []

  const recordsStatus: RecordsStatus =
    !getManyRoute                  ? 'no-route' :
    recordsFetching                ? 'loading'  :
    fetchTrigger === 0             ? 'idle'      :
    recentRecords.length === 0     ? 'empty'     : 'loaded'

  // Layout: all nodes in one horizontal row spaced 400px apart.
  // Collection occupies slot 0 but is raised 140px above the view row so its
  // edge hangs down over the other items.
  const VIEW_ROW_Y = 140
  const COLLECTION_Y = 0
  const SLOT_W = 400

  const baseNodes: Node[] = [
    {
      id: 'collection',
      type: 'collectionRootNode',
      data: {
        title: collection?.title ?? collection?.collection_key ?? 'Collection',
        collKey: collection?.collection_key ?? '',
        onManage: () => {
          void navigate({ to: '/collections' })
        },
      },
      position: { x: 0, y: COLLECTION_Y },
    },
  ]

  const viewNodes: Node[] = []
  const viewEdges: Edge[] = []

  views.forEach((view, idx) => {
    const viewNodeId = `view-${view.view_key}`
    const isExpanded = expandedViews.has(view.view_key)

    // Each view occupies its own slot in the row, starting at slot 1
    viewNodes.push({
      id: viewNodeId,
      type: 'viewNode',
      data: {
        title: view.title || view.view_key,
        viewKey: view.view_key,
        isExpanded,
        onToggle: () => toggleView(view.view_key),
        onDesign: (vk: string) => {
          void navigate({ to: `/collections/${collKey}/views/${vk}/design` })
        },
      },
      position: { x: (idx + 1) * SLOT_W, y: VIEW_ROW_Y },
    })

    // Direct smoothstep edge from collection down to each view
    viewEdges.push({ id: `e-collection-${view.view_key}`, source: 'collection', target: viewNodeId, type: 'smoothstep' })

    // If expanded, show schema and preview
    if (isExpanded) {
      const viewColumns = normalizeColumns(view, allFields)
      const schemaProps = toSchemaProps(viewColumns)
      const previewRows = recentRecords.map((row) =>
        Object.fromEntries(viewColumns.map((col) => [col, getRowValue(row, col)]))
      )

      const schemaNodeId = `view-schema-${view.view_key}`
      const previewNodeId = `view-preview-${view.view_key}`

      viewNodes.push(
        {
          id: schemaNodeId,
          type: 'jsonSchemaNode',
          data: {
            title: view.title || view.view_key,
            properties: schemaProps,
          },
          position: { x: (idx + 1) * SLOT_W - 100, y: VIEW_ROW_Y + 200 },
        },
        {
          id: previewNodeId,
          type: 'viewPreviewNode',
          data: {
            title: view.title || view.view_key,
            columns: viewColumns,
            rows: previewRows,
          },
          position: { x: (idx + 1) * SLOT_W + 100, y: VIEW_ROW_Y + 200 },
        }
      )

      viewEdges.push(
        { id: `e-view-schema-${view.view_key}`, source: viewNodeId, target: schemaNodeId, type: 'smoothstep' },
        { id: `e-view-preview-${view.view_key}`, source: viewNodeId, target: previewNodeId, type: 'smoothstep' }
      )
    }
  })

  const computedNodes: Node[] = [...baseNodes, ...viewNodes]

  const computedEdges: Edge[] = viewEdges

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(computedNodes) }, [adminData, recordsData, collection, views, expandedViews])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [adminData, recordsData, views, expandedViews])               // eslint-disable-line react-hooks/exhaustive-deps

  const recordsCtxValue: RecordsCtxValue = { status: recordsStatus, count: recentRecords.length, onRefresh: handleRefresh }

  return (
    <RecordsCtx.Provider value={recordsCtxValue}>
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={graphNodes}
          edges={graphEdges}
          nodeTypes={FIELD_GRAPH_NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
          <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
          <SharedMiniMap />
        </ReactFlow>
      </div>
    </RecordsCtx.Provider>
  )
}
