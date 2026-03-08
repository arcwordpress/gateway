import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import { useNavigate } from '@tanstack/react-router'
import { FIELD_GRAPH_NODE_TYPES, RecordsCtx, RecordsCtxValue, RecordsStatus, AdminCollectionInfo } from '../../components/graph_node_types'
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
      position: { x: 200, y: 0 },
    },
    {
      id: 'node-records',
      type: 'recordsContainerNode',
      data: { count: recentRecords.length },
      position: { x: 200, y: 170 },
    },
  ]

  const viewNodes: Node[] = []
  const viewEdges: Edge[] = []

  views.forEach((view, idx) => {
    const viewColumns = normalizeColumns(view, allFields)
    
    const schemaProps = toSchemaProps(viewColumns)
    const previewRows = recentRecords.map((row) =>
      Object.fromEntries(viewColumns.map((col) => [col, getRowValue(row, col)]))
    )

    const xOffset = idx * 600
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
        position: { x: xOffset, y: 340 },
      },
      {
        id: previewNodeId,
        type: 'viewPreviewNode',
        data: {
          title: view.title || view.view_key,
          columns: viewColumns,
          rows: previewRows,
        },
        position: { x: xOffset, y: 540 },
      }
    )

    viewEdges.push(
      { id: `e-records-schema-${view.view_key}`, source: 'node-records', target: schemaNodeId },
      { id: `e-schema-preview-${view.view_key}`, source: schemaNodeId, target: previewNodeId },
      { id: `e-records-preview-${view.view_key}`, source: 'node-records', target: previewNodeId }
    )
  })

  const computedNodes: Node[] = [...baseNodes, ...viewNodes]

  const computedEdges: Edge[] = [
    { id: 'e-collection-records', source: 'collection', target: 'node-records' },
    ...viewEdges,
  ]

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(computedNodes) }, [adminData, recordsData, collection, views])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [adminData, recordsData])                     // eslint-disable-line react-hooks/exhaustive-deps

  const recordsCtxValue: RecordsCtxValue = { status: recordsStatus, count: recentRecords.length, onRefresh: handleRefresh }

  return (
    <RecordsCtx.Provider value={recordsCtxValue}>
      <div style={{ width: '100%', height: 'min(72vh, 780px)', minHeight: 420 }}>
        <ReactFlow
          nodes={graphNodes}
          edges={graphEdges}
          nodeTypes={FIELD_GRAPH_NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={(_event, node) => {
            if (node.id.startsWith('view-preview-')) {
              const viewKey = node.id.replace('view-preview-', '')
              void navigate({ to: `/collections/${collKey}/views/${viewKey}/design` })
            }
          }}
          fitView
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} color="#2d3139" />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </RecordsCtx.Provider>
  )
}
