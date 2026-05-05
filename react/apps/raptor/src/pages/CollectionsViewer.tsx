import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  Panel,
} from '@xyflow/react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { useApp } from '../context/app'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { GraphSkeleton } from '../components/graph/GraphSkeleton'
import {
  COLLECTIONS_GRAPH_NODE_TYPES,
  COLLECTIONS_GRAPH_EDGE_TYPES,
  layoutCollectionsDagre,
} from '../components/graph_node_types'
import {
  REL_TYPES,
  CreateRelationshipPanel,
  EditRelationshipPanel,
  type Relationship,
} from '../components/RelationshipPanels'
import { useUserLayout } from '../lib/useUserLayout'

// ─── Types ─────────────────────────────────────────────────────────────────

type Extension = {
  id: number
  key: string
  title: string
  description: string
  status: string
  collections?: { id: number; collection_key: string; title: string }[]
}


type CollectionField = { name: string; label?: string; type?: string }

type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  extension_id: number | null
  relationships: Relationship[] | null
  field_list: { id: number; fields: CollectionField[] } | null
}

type PanelState =
  | { mode: 'create';      extensionId: number }
  | { mode: 'edit';        key: string }
  | { mode: 'delete';      key: string }
  | { mode: 'newRel';      sourceKey: string; targetKey: string }
  | { mode: 'editRel';     rel: Relationship }
  | null

function toKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
}

// ─── Panel geometry ──────────────────────────────────────────────────────────

function usePanelGeometry() {
  const { shellTopOffset, shellHeightCss } = useApp()
  return {
    top: shellTopOffset,
    height: shellHeightCss,
  }
}

// ─── Panel shell ─────────────────────────────────────────────────────────────

function PanelShell({
  title,
  sub,
  onClose,
  children,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
}) {
  const { top, height } = usePanelGeometry()

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top,
        height,
        width: 320,
        background: '#000',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f4f4f5' }}>{title}</div>
          {sub && (
            <div style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace', marginTop: 2 }}>
              {sub}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: 'none',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '2px 4px',
            marginTop: 2,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Shared input styles ─────────────────────────────────────────────────────

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

const baseTextarea =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm resize-none'

// ─── Create panel ─────────────────────────────────────────────────────────────

function CreatePanel({ onClose, extensionId }: { onClose: () => void; extensionId: number }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const key = toKey(title)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collection'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          collection_key: key,
          extension_id: extensionId,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  return (
    <PanelShell title="New Collection" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim() || !key) return
          mutation.mutate()
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            autoFocus
            disabled={mutation.isPending}
            onChange={(e) => setTitle(e.target.value)}
            className={baseInput}
          />
          {key && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Key <span className="text-zinc-600 font-normal">auto-generated</span>
              </label>
              <input
                type="text"
                value={key}
                readOnly
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 font-mono text-xs focus:outline-none cursor-default"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
          <textarea
            value={description}
            rows={3}
            disabled={mutation.isPending}
            onChange={(e) => setDesc(e.target.value)}
            className={baseTextarea}
          />
        </div>

        {mutation.isError && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {(mutation.error as Error).message}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending || !title.trim()}
            className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </PanelShell>
  )
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

function EditPanel({ collKey, onClose }: { collKey: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')

  const { data: collection, isLoading, isError } = useQuery<Collection>({
    queryKey: ['raptor-collections', collKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as Collection
    },
    enabled: !!collKey,
  })

  useEffect(() => {
    if (!collection) return
    setTitle(collection.title ?? '')
    setDesc(collection.description ?? '')
  }, [collection])

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  return (
    <PanelShell title={collection?.title || collKey} sub={collKey} onClose={onClose}>
      {isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Could not load collection data.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (title.trim()) mutation.mutate()
        }}
        className="space-y-4"
      >
        {isLoading ? (
          <>
            <div className="h-8 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-16 rounded-lg bg-zinc-900 animate-pulse" />
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                disabled={mutation.isPending}
                onChange={(e) => setTitle(e.target.value)}
                className={baseInput}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
              <textarea
                value={description}
                rows={3}
                disabled={mutation.isPending}
                onChange={(e) => setDesc(e.target.value)}
                className={baseTextarea}
              />
            </div>
          </>
        )}

        {mutation.isError && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {(mutation.error as Error).message}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending || !title.trim() || isLoading}
            className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </PanelShell>
  )
}

// ─── Delete panel ─────────────────────────────────────────────────────────────

function DeletePanel({ collKey, onClose }: { collKey: string; onClose: () => void }) {
  const queryClient = useQueryClient()

  const { data: collection } = useQuery<Collection>({
    queryKey: ['raptor-collections', collKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as Collection
    },
    enabled: !!collKey,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collKey}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  return (
    <PanelShell title="Delete Collection" sub={collKey} onClose={onClose}>
      <p className="text-sm text-zinc-300 mb-1">
        You are about to delete{' '}
        <span className="font-semibold text-zinc-100">{collection?.title || collKey}</span>.
      </p>
      <p className="text-xs text-zinc-500 mb-6">
        This removes the collection record from the database. This cannot be undone.
      </p>

      {mutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {mutation.isPending ? 'Deleting…' : 'Delete'}
        </button>
        <button
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </PanelShell>
  )
}

// ─── Collections graph ────────────────────────────────────────────────────────

export default function CollectionsViewer() {
  const navigate = useNavigate()
  const [panel, setPanel] = useState<PanelState>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [activeExtensionId, setActiveExtensionId] = useState<number | null>(null)
  const { savedNodes, saveLayout, resetLayout } = useUserLayout('collections')

  // Try to get active extension from URL params if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const extId = params.get('extensionId')
    if (extId) setActiveExtensionId(Number(extId))
  }, [])

  const { data: extensions, isLoading: isExtLoading } = useQuery<Extension[]>({
    queryKey: ['raptor-extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.extensions as Extension[]
    },
  })

  const { data: collections, isLoading: isCollLoading } = useQuery<Collection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
  })

  const isLoading = isExtLoading || isCollLoading

  const openCreate = useCallback((extensionId: number) => {
    setPanel({ mode: 'create', extensionId })
  }, [])
  const openEdit   = useCallback((key: string) => setPanel({ mode: 'edit',   key }), [])
  const openDelete = useCallback((key: string) => setPanel({ mode: 'delete', key }), [])
  const closePanel = useCallback(() => setPanel(null), [])

  const onConnect = useCallback((connection: Connection) => {
    const srcId = connection.source ?? ''
    const tgtId = connection.target ?? ''
    if (!srcId.startsWith('col-') || !tgtId.startsWith('col-')) return
    setPanel({ mode: 'newRel', sourceKey: srcId.replace(/^col-/, ''), targetKey: tgtId.replace(/^col-/, '') })
  }, [])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const rel = edge.data as Relationship | undefined
    if (rel) setPanel({ mode: 'editRel', rel })
  }, [])

  useEffect(() => {
    const cols = collections ?? []
    const exts = extensions ?? []

    const hierarchyNodes: Node[] = []
    const hierarchyEdges: Edge[] = []

    for (const ext of exts) {
      const extId = `ext-${ext.id}`
      const isActive = activeExtensionId === ext.id

      hierarchyNodes.push({
        id: extId,
        type: 'extensionNode',
        data: {
          title: ext.title,
          extKey: ext.key,
          isActive,
          onManage: () => navigate({ to: '/extensions' }),
          onCreate: () => openCreate(ext.id),
        },
        position: { x: 0, y: 0 },
      })

      // Use the extension's collections relationship (from the route) to build edges;
      // fall back to extension_id matching when the route omits the relation.
      const extCollKeys = new Set((ext.collections ?? []).map((c) => c.collection_key))
      const matchCol = extCollKeys.size > 0
        ? (c: Collection) => extCollKeys.has(c.collection_key)
        : (c: Collection) => c.extension_id === ext.id

      for (const col of cols.filter(matchCol)) {
        const colId = `col-${col.collection_key}`
        const colIsActive = activeExtensionId === col.extension_id

        hierarchyNodes.push({
          id: colId,
          type: 'collectionNode',
          data: {
            title: col.title,
            collKey: col.collection_key,
            isActive: colIsActive,
            fields: col.field_list?.fields ?? [],
            onEdit:   () => openEdit(col.collection_key),
            onDelete: () => openDelete(col.collection_key),
            onNavigateFields: () => navigate({ to: `/collections/${col.collection_key}/fields` }),
            onNavigateViews:  () => navigate({ to: `/collections/${col.collection_key}/views` }),
            onNavigateForms:  () => navigate({ to: `/collections/${col.collection_key}/forms` }),
          },
          position: { x: 0, y: 0 },
        })

        hierarchyEdges.push({
          id:           `e-${extId}-${col.collection_key}`,
          source:       extId,
          target:       colId,
          targetHandle: 'conn-left',
          type:         'smoothstep',
        })
      }
    }

    const laidOut = layoutCollectionsDagre(hierarchyNodes, hierarchyEdges)

    // Apply saved positions on top of Dagre positions when available
    const withSaved = laidOut.map((n) => {
      const saved = savedNodes?.find((s) => s.id === n.id)
      return saved ? { ...n, position: { x: saved.x, y: saved.y } } : n
    })

    // Relationship edges
    const relEdges: Edge[] = []
    for (const col of cols) {
      for (const rel of col.relationships ?? []) {
        const srcId = `col-${rel.source}`
        const tgtId = `col-${rel.target}`
        relEdges.push({
          id:                   `rel-${rel.id}`,
          source:               srcId,
          target:               tgtId,
          label:                REL_TYPES.find((r) => r.value === rel.type)?.label ?? rel.type,
          labelStyle:           { fill: '#a1a1aa', fontSize: 10 },
          labelBgStyle:         { fill: 'var(--node-bg)', fillOpacity: 1 },
          labelBgPadding:       [4, 3] as [number, number],
          labelBgBorderRadius:  3,
          style:                { stroke: '#52525b', strokeDasharray: '5 3', cursor: 'pointer' },
          type:                 'smoothstep',
          data:                 rel,
        })
      }
    }

    setNodes(withSaved)
    setEdges([...hierarchyEdges, ...relEdges])
  }, [collections, extensions, activeExtensionId, savedNodes, openCreate, openEdit, openDelete, navigate, setNodes, setEdges])

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, _node: Node, allNodes: Node[]) => {
      saveLayout(allNodes)
    },
    [saveLayout],
  )

  return (
    <>
      {isLoading
        ? <GraphSkeleton />
        : <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={COLLECTIONS_GRAPH_NODE_TYPES}
            edgeTypes={COLLECTIONS_GRAPH_EDGE_TYPES}
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
      }

      {panel?.mode === 'create'  && <CreatePanel extensionId={panel.extensionId} onClose={closePanel} />}
      {panel?.mode === 'edit'    && <EditPanel   collKey={panel.key}             onClose={closePanel} />}
      {panel?.mode === 'delete'  && <DeletePanel collKey={panel.key}             onClose={closePanel} />}
      {panel?.mode === 'newRel'  && (
        <CreateRelationshipPanel
          sourceKey={panel.sourceKey}
          targetKey={panel.targetKey}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
      {panel?.mode === 'editRel' && (
        <EditRelationshipPanel
          rel={panel.rel}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
    </>
  )
}
