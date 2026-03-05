import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react'
import { JsonSchemaProp, RecordsStatus, RecordsCtxValue, RecordsCtx, FIELD_GRAPH_NODE_TYPES, AdminCollectionInfo } from '../../components/graph_node_types'
import { Field } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'
import { useCollection, useFields } from './FieldsPageContext'

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

// ─── Graph component ──────────────────────────────────────────────────────────

export function Graph() {
  const { collection } = useCollection()
  const { fields }     = useFields()
  const collKey = collection?.collection_key ?? ''

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

  // Initialize to 1 so records fetch automatically on mount; increment on each manual refresh
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

  const computedNodes: Node[] = [
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

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(computedNodes) }, [adminData, recordsData, collection, fields])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [adminData, recordsData])                     // eslint-disable-line react-hooks/exhaustive-deps

  const recordsCtxValue: RecordsCtxValue = { status: recordsStatus, count: recentRecords.length, onRefresh: handleRefresh }

  return (
    <RecordsCtx.Provider value={recordsCtxValue}>
      <div style={{ width: '100%', height: '100vh' }}>
        <ReactFlow
          nodes={graphNodes}
          edges={graphEdges}
          nodeTypes={FIELD_GRAPH_NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
