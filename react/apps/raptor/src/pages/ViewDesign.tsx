import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
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
import { viewDesignRoute } from '../router'
import { FIELD_GRAPH_NODE_TYPES, RecordsCtx, RecordsCtxValue, RecordsStatus, AdminCollectionInfo } from '../components/graph_node_types'
import { apiUrl, authHeaders } from '../lib/api'
import { Collection, Field, View } from '../lib/object_types'

function getRowValue(row: Record<string, unknown>, column: string): unknown {
  if (column in row) return row[column]
  const lookup = column.toLowerCase()
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase() === lookup) return value
  }
  return undefined
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

  if (Array.isArray(view.columns)) {
    const normalized = view.columns.map(resolve).filter(Boolean)
    return Array.from(new Set(normalized))
  }
  return fields.map((f) => f.name)
}

function ViewDesignContent({ collectionKey, viewKey }: { collectionKey: string; viewKey: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: collection, isLoading: collLoading } = useQuery<Collection>({
    queryKey: ['raptor-collections', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collectionKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to load collection')
      const json = await res.json()
      return json.collection as Collection
    },
  })

  const { data: view, isLoading: viewLoading } = useQuery<View>({
    queryKey: ['raptor-view', viewKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to load view')
      const json = await res.json()
      return json.view as View
    },
  })

  const [draftView, setDraftView] = useState<View | null>(null)

  useEffect(() => {
    if (view) setDraftView(view)
  }, [view])

  const allFields = collection?.field_list?.fields ?? []

  const { data: adminData } = useQuery<AdminCollectionInfo | null>({
    queryKey: ['admin-data-collection', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) return null
      const json = await res.json() as { collections?: AdminCollectionInfo[] }
      return json.collections?.find(c => c.key === collectionKey) ?? null
    },
    enabled: !!collectionKey,
    staleTime: 30_000,
  })

  const getManyRoute = adminData?.routes.find(r => r.type === 'get_many')?.route ?? null

  const [fetchTrigger, setFetchTrigger] = useState(1)
  const { data: recordsData, isFetching: recordsFetching } = useQuery<Record<string, unknown>[]>({
    queryKey: ['view-design-records', collectionKey, fetchTrigger],
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
    !getManyRoute ? 'no-route' :
      recordsFetching ? 'loading' :
        fetchTrigger === 0 ? 'idle' :
          recentRecords.length === 0 ? 'empty' : 'loaded'

  const viewColumns = draftView ? normalizeColumns(draftView, allFields) : []
  const previewRows = recentRecords.map((row) =>
    Object.fromEntries(viewColumns.map((col) => [col, getRowValue(row, col)]))
  )

  const computedNodes: Node[] = [
    {
      id: 'view-preview',
      type: 'viewPreviewNode',
      data: {
        title: draftView?.title ?? viewKey,
        columns: viewColumns,
        rows: previewRows,
      },
      position: { x: 300, y: 200 },
      style: { width: 720 },
    },
  ]

  const computedEdges: Edge[] = []

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(computedNodes) }, [adminData, recordsData, draftView, collection])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [adminData, recordsData, draftView])              // eslint-disable-line react-hooks/exhaustive-deps

  const recordsCtxValue: RecordsCtxValue = {
    status: recordsStatus,
    count: recentRecords.length,
    onRefresh: handleRefresh,
  }

  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  useEffect(() => {
    if (view) setSelectedColumns(view.columns ?? [])
  }, [view])

  const toggleColumn = (fieldName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(fieldName)
        ? prev.filter((name) => name !== fieldName)
        : [...prev, fieldName]
    )
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draftView) throw new Error('No view to save')
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          title: draftView.title,
          description: draftView.description,
          source: draftView.source,
          per_page: draftView.per_page,
          columns: selectedColumns,
          status: draftView.status,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to save view')
      return json.view as View
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['raptor-view', viewKey] })
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
    },
  })

  useEffect(() => {
    if (!view || !draftView) return

    // Check if there are actual changes compared to the original view
    const hasChanges =
      view.title !== draftView.title ||
      view.description !== draftView.description ||
      view.per_page !== draftView.per_page ||
      JSON.stringify(view.columns ?? []) !== JSON.stringify(selectedColumns)

    if (!hasChanges) return

    const timer = setTimeout(() => {
      saveMutation.mutate()
    }, 800)
    return () => clearTimeout(timer)
  }, [selectedColumns, draftView?.title, draftView?.description, draftView?.per_page, view, saveMutation]) // eslint-disable-line react-hooks/exhaustive-deps

  if (collLoading || viewLoading || !draftView) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading view designer...
      </div>
    )
  }

  return (
    <RecordsCtx.Provider value={recordsCtxValue}>
      <div className="relative w-full h-screen">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 h-12 bg-gray-900/90 backdrop-blur border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: `/collections/${collectionKey}/views` })}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Back to Views
            </button>
            <span className="text-gray-600">|</span>
            <h1 className="text-white text-sm font-medium">{draftView.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              {saveMutation.isPending ? 'Saving...' : saveMutation.isSuccess ? 'Saved' : ''}
            </div>
          </div>
        </div>

        {/* React Flow Canvas (edge-to-edge) */}
        <div className="absolute inset-0">
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

        {/* Right Panel */}
        <div className="absolute top-12 right-0 bottom-0 w-96 bg-gray-900/95 backdrop-blur border-l border-gray-800 overflow-y-auto z-10">
          <div className="p-6">
            <h2 className="text-white text-lg font-semibold mb-6">View Properties</h2>

            <div className="space-y-6">
              {/* Basic Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={draftView.title}
                  onChange={(e) => setDraftView({ ...draftView, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={draftView.description}
                  onChange={(e) => setDraftView({ ...draftView, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Per Page</label>
                <input
                  type="number"
                  value={draftView.per_page}
                  onChange={(e) => setDraftView({ ...draftView, per_page: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                  min={1}
                />
              </div>

              {/* Columns */}
              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Columns</h3>
                {allFields.length === 0 ? (
                  <p className="text-xs text-gray-500">No fields available</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allFields.map((field) => {
                      const checked = selectedColumns.includes(field.name)
                      return (
                        <label
                          key={field.name}
                          className="flex items-center justify-between gap-3 rounded border border-gray-800 px-3 py-2 cursor-pointer hover:bg-gray-800/50"
                        >
                          <div className="min-w-0">
                            <div className="text-sm text-gray-200 truncate">{field.label || field.name}</div>
                            <div className="text-xs text-gray-500 font-mono truncate">{field.name}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleColumn(field.name)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-500"
                          />
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RecordsCtx.Provider>
  )
}

export default function ViewDesignPage() {
  const { collectionKey, viewKey } = viewDesignRoute.useParams()
  return <ViewDesignContent collectionKey={collectionKey} viewKey={viewKey} />
}