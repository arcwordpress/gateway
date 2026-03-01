import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Handle,
  Position,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { appConfig } from '../config'
import { useApp } from '../context/app'

// ─── Types ─────────────────────────────────────────────────────────────────

type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
}

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit';   key: string }
  | { mode: 'delete'; key: string }
  | null

type RootNodeType = Node<Record<string, never>, 'collectionsRootNode'>
type CollNodeType = Node<{ title: string; collKey: string }, 'collectionNode'>
type ActNodeType  = Node<{ actions: { label: string; onClick: () => void }[] }, 'actionsNode'>

function toKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
}

// ─── Custom node: Collections root ──────────────────────────────────────────

function CollectionsRootNode(_: NodeProps<RootNodeType>) {
  return (
    <div
      style={{
        background: '#14532d',
        border: '1px solid #16a34a',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#f0fdf4',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        minWidth: 130,
        textAlign: 'center',
      }}
    >
      Collections
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// ─── Custom node: Collection ─────────────────────────────────────────────────

function CollectionNode({ data }: NodeProps<CollNodeType>) {
  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 14px',
        width: 180,
        color: '#e2e8f0',
        fontSize: 13,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 500 }}>{data.title}</div>
      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
        {data.collKey}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// ─── Custom node: Actions ────────────────────────────────────────────────────

function ActionsNode({ data }: NodeProps<ActNodeType>) {
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: 8,
        minWidth: 140,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          padding: '5px 10px',
          borderBottom: '1px solid #1e1e1e',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#f0f0f0',
          userSelect: 'none',
        }}
      >
        Actions
      </div>
      <div>
        {data.actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '5px 10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#e8e8e8',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  collectionsRootNode: CollectionsRootNode as React.ComponentType<NodeProps>,
  collectionNode:      CollectionNode      as React.ComponentType<NodeProps>,
  actionsNode:         ActionsNode         as React.ComponentType<NodeProps>,
}

// ─── Dagre layout ────────────────────────────────────────────────────────────

const NODE_DIMS: Record<string, { w: number; h: number }> = {
  collectionsRootNode: { w: 130, h: 42 },
  collectionNode:      { w: 180, h: 54 },
  actionsNode:         { w: 140, h: 80 },
}

function layoutWithDagre(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 40 })

  nodes.forEach((n) => {
    const { w, h } = NODE_DIMS[n.type ?? ''] ?? { w: 160, h: 50 }
    g.setNode(n.id, { width: w, height: h })
  })
  edges.forEach((e) => g.setEdge(e.source, e.target))

  Dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    const { w, h } = NODE_DIMS[n.type ?? ''] ?? { w: 160, h: 50 }
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } }
  })
}

// ─── Panel geometry ──────────────────────────────────────────────────────────

function usePanelGeometry() {
  const { isExpanded } = useApp()
  const constrained = appConfig.isWordPress && !isExpanded
  return {
    top:    constrained ? 32  : 0,
    height: constrained ? 'calc(100vh - 32px)' : '100vh',
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
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{title}</div>
          {sub && (
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginTop: 2 }}>
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
            color: '#64748b',
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
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm'

const baseTextarea =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm resize-none'

// ─── Create panel ─────────────────────────────────────────────────────────────

function CreatePanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const key = toKey(title)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collections'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          collection_key: key,
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
          <label className="block text-xs font-medium text-gray-400 mb-1">
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
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Key <span className="text-gray-600 font-normal">auto-generated</span>
              </label>
              <input
                type="text"
                value={key}
                readOnly
                className="w-full px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800/50 text-gray-500 font-mono text-xs focus:outline-none cursor-default"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
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
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-medium transition-colors"
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
      const res = await fetch(apiUrl(`gateway/v1/raptor/collections/${collKey}`), {
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
      const res = await fetch(apiUrl(`gateway/v1/raptor/collections/${collKey}`), {
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
            <div className="h-8 rounded-lg bg-gray-900 animate-pulse" />
            <div className="h-16 rounded-lg bg-gray-900 animate-pulse" />
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
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
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
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
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-medium transition-colors"
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
      const res = await fetch(apiUrl(`gateway/v1/raptor/collections/${collKey}`), {
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
      const res = await fetch(apiUrl(`gateway/v1/raptor/collections/${collKey}`), {
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
      <p className="text-sm text-gray-300 mb-1">
        You are about to delete{' '}
        <span className="font-semibold text-gray-100">{collection?.title || collKey}</span>.
      </p>
      <p className="text-xs text-gray-500 mb-6">
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
          className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </PanelShell>
  )
}

// ─── Collections graph ────────────────────────────────────────────────────────

export default function Collections() {
  const [panel, setPanel] = useState<PanelState>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collections'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
  })

  const openCreate = useCallback(() => setPanel({ mode: 'create' }), [])
  const openEdit   = useCallback((key: string) => setPanel({ mode: 'edit',   key }), [])
  const openDelete = useCallback((key: string) => setPanel({ mode: 'delete', key }), [])
  const closePanel = useCallback(() => setPanel(null), [])

  useEffect(() => {
    const cols = collections ?? []

    const rawNodes: Node[] = [
      {
        id: 'collections-root',
        type: 'collectionsRootNode',
        data: {},
        position: { x: 0, y: 0 },
      },
      {
        id: 'root-actions',
        type: 'actionsNode',
        data: { actions: [{ label: 'Create Collection', onClick: openCreate }] },
        position: { x: 0, y: 0 },
      },
    ]

    const rawEdges: Edge[] = [
      {
        id: 'e-root-actions',
        source: 'collections-root',
        target: 'root-actions',
        style: { stroke: '#334155' },
      },
    ]

    for (const col of cols) {
      const colId = `col-${col.collection_key}`
      const actId = `act-${col.collection_key}`

      rawNodes.push({
        id: colId,
        type: 'collectionNode',
        data: { title: col.title, collKey: col.collection_key },
        position: { x: 0, y: 0 },
      })
      rawNodes.push({
        id: actId,
        type: 'actionsNode',
        data: {
          actions: [
            { label: 'Edit',   onClick: () => openEdit(col.collection_key) },
            { label: 'Delete', onClick: () => openDelete(col.collection_key) },
          ],
        },
        position: { x: 0, y: 0 },
      })

      rawEdges.push({
        id: `e-root-${col.collection_key}`,
        source: 'collections-root',
        target: colId,
        style: { stroke: '#16a34a' },
      })
      rawEdges.push({
        id: `e-${col.collection_key}-act`,
        source: colId,
        target: actId,
        style: { stroke: '#334155' },
      })
    }

    setNodes(layoutWithDagre(rawNodes, rawEdges))
    setEdges(rawEdges)
  }, [collections, openCreate, openEdit, openDelete, setNodes, setEdges])

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div
        className="flex-1 rounded-xl overflow-hidden border border-gray-800"
        style={{ minHeight: 520 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Lines} gap={24} color="#1f2937" />
          <Controls />
          <MiniMap
            nodeColor="#1e293b"
            nodeStrokeColor="#334155"
            maskColor="rgba(3,7,18,0.7)"
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {panel?.mode === 'create' && <CreatePanel onClose={closePanel} />}
      {panel?.mode === 'edit'   && <EditPanel   collKey={panel.key} onClose={closePanel} />}
      {panel?.mode === 'delete' && <DeletePanel collKey={panel.key} onClose={closePanel} />}
    </div>
  )
}
