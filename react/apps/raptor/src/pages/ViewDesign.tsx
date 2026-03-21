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
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import { DndContext, DragOverlay, closestCenter, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { viewDesignRoute } from '../router'
import { FIELD_GRAPH_NODE_TYPES, RecordsCtx, RecordsCtxValue, RecordsStatus, AdminCollectionInfo } from '../components/graph_node_types'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { FacetPalette, FacetBlock } from '../components/FacetPalette'
import { type FacetType, type DroppedFacet } from '../lib/facet_types'
import { apiUrl, authHeaders } from '../lib/api'
import { Collection, Facet, Field, View, ViewRender } from '../lib/object_types'

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
  const [activeFacetType, setActiveFacetType] = useState<FacetType | null>(null)
  const [droppedFacets, setDroppedFacets] = useState<DroppedFacet[]>([])

  function handleDragStart(e: DragStartEvent) {
    if (e.active.data.current?.facetType) {
      setActiveFacetType(e.active.data.current.facetType as FacetType)
    }
  }
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e

    // Palette drag — insert at position of hovered item, or append
    if (active.data.current?.facetType && activeFacetType) {
      const newFacet: DroppedFacet = {
        id: `df_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: activeFacetType,
      }
      if (over && over.id !== 'facet-drop-zone') {
        const overIndex = droppedFacets.findIndex((f) => f.id === over.id)
        if (overIndex !== -1) {
          setDroppedFacets((prev) => [
            ...prev.slice(0, overIndex),
            newFacet,
            ...prev.slice(overIndex),
          ])
          setActiveFacetType(null)
          return
        }
      }
      if (over) setDroppedFacets((prev) => [...prev, newFacet])
      setActiveFacetType(null)
      return
    }

    // Sort drag — reorder within drop zone
    if (active.data.current?.droppedFacet && over && over.id !== active.id) {
      const oldIndex = droppedFacets.findIndex((f) => f.id === active.id)
      const newIndex = droppedFacets.findIndex((f) => f.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        setDroppedFacets((prev) => arrayMove(prev, oldIndex, newIndex))
      }
    }

    setActiveFacetType(null)
  }

  useEffect(() => {
    if (view) setDraftView(view)
  }, [view])

  const allFields = collection?.field_list?.fields ?? []

  // ── Render strategies (engine types from API) ────────────────────────────
  const { data: renderStrategies } = useQuery<{ type: string }[]>({
    queryKey: ['render-strategies'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/views/renders'), { headers: authHeaders() })
      if (!res.ok) return []
      return res.json() as Promise<{ type: string }[]>
    },
    staleTime: Infinity,
  })

  // ── ViewRender CRUD ───────────────────────────────────────────────────────
  const { data: viewRenders, refetch: refetchRenders } = useQuery<ViewRender[]>({
    queryKey: ['view-renders', viewKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/renders`), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json() as { renders?: ViewRender[] }
      return json.renders ?? []
    },
    enabled: !!viewKey,
  })

  const [activeEngine, setActiveEngine] = useState<string | null>(null)
  const [activeJsType, setActiveJsType] = useState<string>('react')

  const handleSelectEngine = useCallback((type: string) => {
    setActiveEngine((prev) => (prev === type ? null : type))
  }, [])

  const handleSelectJsType = useCallback((type: string) => {
    setActiveJsType(type)
  }, [])

  const saveRenderMutation = useMutation({
    mutationFn: async () => {
      if (!activeEngine) throw new Error('No engine selected')
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/renders`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ engine: activeEngine, js_type: activeJsType }),
      })
      const json = await res.json() as { success: boolean; message?: string }
      if (!json.success) throw new Error(json.message ?? 'Failed to save render')
    },
    onSuccess: () => { void refetchRenders() },
  })

  const deleteRenderMutation = useMutation({
    mutationFn: async (renderId: number) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/renders/${renderId}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json() as { success: boolean }
      if (!json.success) throw new Error('Failed to delete render')
    },
    onSuccess: () => { void refetchRenders() },
  })

  const handleSaveRender = useCallback(() => {
    saveRenderMutation.mutate()
  }, [saveRenderMutation])

  const handleDeleteRender = useCallback((id: number) => {
    deleteRenderMutation.mutate(id)
  }, [deleteRenderMutation])

  // ── Facets CRUD ───────────────────────────────────────────────────────────
  const { data: facets, refetch: refetchFacets } = useQuery<Facet[]>({
    queryKey: ['view-facets', viewKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/facets`), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json() as { facets?: Facet[] }
      return json.facets ?? []
    },
    enabled: !!viewKey,
  })

  const addFacetMutation = useMutation({
    mutationFn: async (data: { label: string; field_name: string; facet_type: string }) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/facets`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json() as { success: boolean; message?: string }
      if (!json.success) throw new Error(json.message ?? 'Failed to save facet')
    },
    onSuccess: () => { void refetchFacets() },
  })

  const deleteFacetMutation = useMutation({
    mutationFn: async (facetId: number) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/facets/${facetId}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json() as { success: boolean }
      if (!json.success) throw new Error('Failed to delete facet')
    },
    onSuccess: () => { void refetchFacets() },
  })

  const handleAddFacet = useCallback((data: { label: string; field_name: string; facet_type: string }) => {
    addFacetMutation.mutate(data)
  }, [addFacetMutation])

  const handleDeleteFacet = useCallback((id: number) => {
    deleteFacetMutation.mutate(id)
  }, [deleteFacetMutation])

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

  const strategies = renderStrategies ?? []
  const saves = viewRenders ?? []
  const savedFacets = facets ?? []

  const computedNodes: Node[] = [
    {
      id: 'view-preview',
      type: 'viewPreviewNode',
      data: {
        title: draftView?.title ?? viewKey,
        columns: viewColumns,
        rows: previewRows,
        droppedFacets,
        onReorderFacets: setDroppedFacets,
      },
      position: { x: 50, y: 80 },
      style: { width: 720 },
    },
    {
      id: 'render-strategy',
      type: 'renderStrategyNode',
      data: {
        strategies,
        viewRenders: saves,
        activeEngine,
        activeJsType,
        onSelectEngine: handleSelectEngine,
        onSelectJsType: handleSelectJsType,
        onSaveRender: handleSaveRender,
        onDeleteRender: handleDeleteRender,
        isSaving: saveRenderMutation.isPending,
      },
      position: { x: 240, y: 520 },
    },
    {
      id: 'facets-config',
      type: 'facetsNode',
      data: {
        facets: savedFacets,
        availableFields: allFields,
        onAddFacet: handleAddFacet,
        onDeleteFacet: handleDeleteFacet,
        isSaving: addFacetMutation.isPending,
      },
      position: { x: 700, y: 520 },
    },
    ...(activeEngine
      ? [
          {
            id: 'render-output',
            type: 'renderOutputNode',
            data: { strategyType: activeEngine, viewKey },
            position: { x: 600, y: 680 },
          },
        ]
      : []),
  ]

  const computedEdges: Edge[] = [
    {
      id: 'edge-preview-to-strategy',
      source: 'view-preview',
      target: 'render-strategy',
      type: 'default',
      style: { stroke: '#3f3f46' },
    },
    ...(activeEngine
      ? [
          {
            id: 'edge-strategy-to-output',
            source: 'render-strategy',
            target: 'render-output',
            type: 'default',
            style: { stroke: '#3f3f46' },
          },
        ]
      : []),
  ]

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(computedNodes) }, [adminData, recordsData, draftView, collection, renderStrategies, viewRenders, activeEngine, activeJsType, saveRenderMutation.isPending, facets, addFacetMutation.isPending, droppedFacets])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [adminData, recordsData, draftView, activeEngine])                                                                                           // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex items-center justify-center h-screen text-zinc-400">
        Loading view designer...
      </div>
    )
  }

  return (
    <RecordsCtx.Provider value={recordsCtxValue}>
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-screen">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 h-12 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: `/collections/${collectionKey}/views` })}
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              ← Back to Views
            </button>
            <span className="text-zinc-600">|</span>
            <h1 className="text-white text-sm font-medium">{draftView.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-zinc-500">
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
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} color="#2d3139" />
            <Controls />
            <SharedMiniMap />
          </ReactFlow>
        </div>

        {/* Facet Palette */}
        <FacetPalette activeFacetType={activeFacetType} />

        <DragOverlay>
          {activeFacetType ? <FacetBlock type={activeFacetType} /> : null}
        </DragOverlay>

        {/* Right Panel */}
        <div className="absolute top-12 right-0 bottom-0 w-96 bg-zinc-900/95 backdrop-blur border-l border-zinc-800 overflow-y-auto z-10">
          <div className="p-6">
            <h2 className="text-white text-lg font-semibold mb-6">View Properties</h2>

            <div className="space-y-6">
              {/* Basic Settings */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                <input
                  type="text"
                  value={draftView.title}
                  onChange={(e) => setDraftView({ ...draftView, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={draftView.description}
                  onChange={(e) => setDraftView({ ...draftView, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Per Page</label>
                <input
                  type="number"
                  value={draftView.per_page}
                  onChange={(e) => setDraftView({ ...draftView, per_page: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
                  min={1}
                />
              </div>

              {/* Columns */}
              <div className="pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Columns</h3>
                {allFields.length === 0 ? (
                  <p className="text-xs text-zinc-500">No fields available</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allFields.map((field) => {
                      const checked = selectedColumns.includes(field.name)
                      return (
                        <label
                          key={field.name}
                          className="flex items-center justify-between gap-3 rounded border border-zinc-800 px-3 py-2 cursor-pointer hover:bg-zinc-800/50"
                        >
                          <div className="min-w-0">
                            <div className="text-sm text-zinc-200 truncate">{field.label || field.name}</div>
                            <div className="text-xs text-zinc-500 font-mono truncate">{field.name}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleColumn(field.name)}
                            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-zinc-400"
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
      </DndContext>
    </RecordsCtx.Provider>
  )
}

export default function ViewDesignPage() {
  const { collectionKey, viewKey } = viewDesignRoute.useParams()
  return <ViewDesignContent collectionKey={collectionKey} viewKey={viewKey} />
}