import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ReactFlow,
  Handle,
  Position,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
  type Connection,
} from '@xyflow/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import Dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders, generateId } from '../lib/api'
import { useApp } from '../context/app'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'

// ─── Types ─────────────────────────────────────────────────────────────────

type Relationship = {
  id: string
  source: string
  target: string
  type: 'belongsTo' | 'hasMany' | 'hasOne'
  methodName: string
  foreignKey: string
  ownerKey: string
}

type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  relationships: Relationship[] | null
}

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit';         key: string }
  | { mode: 'delete';       key: string }
  | { mode: 'relationship'; sourceKey: string; targetKey: string }
  | null

type RootNodeType = Node<Record<string, never>, 'collectionsRootNode'>
type CollNodeType = Node<{ title: string; collKey: string; extKey: string }, 'collectionNode'>
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
        background: '#3f3f46',
        border: '1px solid #16a34a',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#e4e4e7',
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
  const navigate = useNavigate()
  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={() => void navigate({ to: '/extensions/$extKey/collections/$collKey/fields' as any, params: { extKey: data.extKey, collKey: data.collKey } as any })}
      style={{
        background: '#27272a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 14px',
        width: 180,
        color: '#e4e4e7',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {/* Vertical hierarchy handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Relationship handles on sides */}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        style={{ background: '#71717a', width: 8, height: 8 }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ background: '#71717a', width: 8, height: 8 }}
      />

      <div style={{ fontWeight: 500 }}>{data.title}</div>
      <div style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', marginTop: 2 }}>
        {data.collKey}
      </div>
    </div>
  )
}

// ─── Custom node: Actions ────────────────────────────────────────────────────

function ActionsNode({ data }: NodeProps<ActNodeType>) {
  return (
    <div
      style={{
        background: '#18181b',
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
          color: '#e4e4e7',
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
              color: '#d4d4d8',
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
        background: 'var(--app-bg)',
        borderLeft: '1px solid #3f3f46',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #3f3f46',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#e4e4e7' }}>{title}</div>
          {sub && (
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', marginTop: 2 }}>
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

function CreatePanel({ extensionKey, onClose }: { extensionKey: string; onClose: () => void }) {
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
          extension_key: extensionKey,
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

// ─── Relationship panel ───────────────────────────────────────────────────────

const REL_TYPES: { value: Relationship['type']; label: string; hint: string }[] = [
  { value: 'belongsTo', label: 'Belongs To',  hint: 'Source has the foreign key → target' },
  { value: 'hasMany',   label: 'Has Many',    hint: 'Target has the foreign key → source (collection)' },
  { value: 'hasOne',    label: 'Has One',     hint: 'Target has the foreign key → source (single)' },
]

function RelationshipPanel({
  sourceKey,
  targetKey,
  collections,
  onClose,
}: {
  sourceKey: string
  targetKey: string
  collections: Collection[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [type, setType] = useState<Relationship['type']>('belongsTo')
  const [methodName, setMethodName] = useState('')
  const [foreignKey, setForeignKey] = useState('')
  const [ownerKey, setOwnerKey] = useState('id')

  const sourceTitle = collections.find((c) => c.collection_key === sourceKey)?.title ?? sourceKey
  const targetTitle = collections.find((c) => c.collection_key === targetKey)?.title ?? targetKey

  const mutation = useMutation({
    mutationFn: async () => {
      // Fetch current relationships for source collection
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${sourceKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const existing: Relationship[] = json.collection?.relationships ?? []

      const newRel: Relationship = {
        id:         generateId(),
        source:     sourceKey,
        target:     targetKey,
        type,
        methodName: methodName.trim(),
        foreignKey: foreignKey.trim(),
        ownerKey:   ownerKey.trim() || 'id',
      }

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${sourceKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ relationships: [...existing, newRel] }),
      })
      const patchJson = await patchRes.json()
      if (!patchJson.success) throw new Error(patchJson.message ?? 'Failed to save relationship')
      return patchJson
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  return (
    <PanelShell
      title="New Relationship"
      sub={`${sourceKey} → ${targetKey}`}
      onClose={onClose}
    >
      {/* Source → Target display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          padding: '8px 10px',
          background: '#18181b',
          borderRadius: 6,
          border: '1px solid #3f3f46',
        }}
      >
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>{sourceTitle}</span>
        <span style={{ fontSize: 12, color: '#71717a' }}>→</span>
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>{targetTitle}</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!methodName.trim()) return
          mutation.mutate()
        }}
        className="space-y-4"
      >
        {/* Relationship type */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Type <span className="text-red-400">*</span>
          </label>
          <div className="space-y-1.5">
            {REL_TYPES.map((rt) => (
              <label
                key={rt.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: `1px solid ${type === rt.value ? '#52525b' : '#27272a'}`,
                  background: type === rt.value ? '#1e3a5f' : '#18181b',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="relType"
                  value={rt.value}
                  checked={type === rt.value}
                  onChange={() => setType(rt.value)}
                  style={{ marginTop: 2, accentColor: '#52525b' }}
                />
                <div>
                  <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>{rt.label}</div>
                  <div style={{ fontSize: 10, color: '#71717a', marginTop: 1 }}>{rt.hint}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Method name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Method Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={methodName}
            autoFocus
            disabled={mutation.isPending}
            placeholder={type === 'hasMany' ? 'comments' : type === 'belongsTo' ? 'post' : 'profile'}
            onChange={(e) => setMethodName(e.target.value)}
            className={baseInput}
          />
          <p className="mt-1 text-[10px] text-zinc-600">camelCase PHP method on the source model</p>
        </div>

        {/* Foreign key */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Foreign Key</label>
          <input
            type="text"
            value={foreignKey}
            disabled={mutation.isPending}
            placeholder={`${targetKey}_id`}
            onChange={(e) => setForeignKey(e.target.value)}
            className={baseInput}
          />
        </div>

        {/* Owner key */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Owner Key</label>
          <input
            type="text"
            value={ownerKey}
            disabled={mutation.isPending}
            placeholder="id"
            onChange={(e) => setOwnerKey(e.target.value)}
            className={baseInput}
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
            disabled={mutation.isPending || !methodName.trim()}
            className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Add Relationship'}
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

// ─── Collections graph ────────────────────────────────────────────────────────

export default function Collections() {
  const { extKey } = useParams({ strict: false }) as { extKey: string }
  const [panel, setPanel] = useState<PanelState>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [canvasHost, setCanvasHost] = useState<HTMLElement | null>(null)
  useEffect(() => { setCanvasHost(document.getElementById('gateway-raptor-canvas-host')) }, [])

  const { isError: extNotFound } = useQuery({
    queryKey: ['raptor-extension', extKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${extKey}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extension
    },
    retry: false,
  })

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ['raptor-collections', extKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection?extension_key=${encodeURIComponent(extKey)}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
    enabled: !extNotFound,
  })

  const openCreate = useCallback(() => setPanel({ mode: 'create' }), [])
  const openEdit   = useCallback((key: string) => setPanel({ mode: 'edit',   key }), [])
  const openDelete = useCallback((key: string) => setPanel({ mode: 'delete', key }), [])
  const closePanel = useCallback(() => setPanel(null), [])

  // Detect when user draws a connection between two collection nodes
  const onConnect = useCallback((connection: Connection) => {
    const srcId = connection.source ?? ''
    const tgtId = connection.target ?? ''

    // Only open relationship panel when both are collection nodes (prefixed 'col-')
    if (!srcId.startsWith('col-') || !tgtId.startsWith('col-')) return

    const sourceKey = srcId.replace(/^col-/, '')
    const targetKey = tgtId.replace(/^col-/, '')

    setPanel({ mode: 'relationship', sourceKey, targetKey })
  }, [])

  useEffect(() => {
    const cols = collections ?? []

    // Hierarchy nodes / edges (used for Dagre layout)
    const hierarchyNodes: Node[] = [
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

    const hierarchyEdges: Edge[] = [
      {
        id: 'e-root-actions',
        source: 'collections-root',
        target: 'root-actions',
        style: { stroke: '#3f3f46' },
      },
    ]

    for (const col of cols) {
      const colId = `col-${col.collection_key}`
      const actId = `act-${col.collection_key}`

      hierarchyNodes.push({
        id: colId,
        type: 'collectionNode',
        data: { title: col.title, collKey: col.collection_key, extKey },
        position: { x: 0, y: 0 },
      })
      hierarchyNodes.push({
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

      hierarchyEdges.push({
        id: `e-root-${col.collection_key}`,
        source: 'collections-root',
        target: colId,
        style: { stroke: '#52525b' },
      })
      hierarchyEdges.push({
        id: `e-${col.collection_key}-act`,
        source: colId,
        target: actId,
        style: { stroke: '#3f3f46' },
      })
    }

    // Relationship edges — drawn between collection nodes via side handles
    const relEdges: Edge[] = []
    for (const col of cols) {
      for (const rel of col.relationships ?? []) {
        const srcId = `col-${rel.source}`
        const tgtId = `col-${rel.target}`
        relEdges.push({
          id:          `rel-${rel.id}`,
          source:      srcId,
          target:      tgtId,
          label:       `${rel.type}: ${rel.methodName}`,
          labelStyle:  { fill: '#71717a', fontSize: 10 },
          style:       { stroke: '#52525b', strokeDasharray: '5 3' },
          type:        'straight',
        })
      }
    }

    setNodes(layoutWithDagre(hierarchyNodes, hierarchyEdges))
    setEdges([...hierarchyEdges, ...relEdges])
  }, [collections, openCreate, openEdit, openDelete, setNodes, setEdges])

  if (extNotFound) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-sm">Extension not found.</p>
      </div>
    )
  }

  return (
    <>
      {/* Surface: portaled into the app container, absolute inset-0, beneath all chrome */}
      {canvasHost && createPortal(
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
            <Controls />
            <SharedMiniMap />
          </ReactFlow>
        </div>,
        canvasHost
      )}

      {panel?.mode === 'create'       && <CreatePanel extensionKey={extKey} onClose={closePanel} />}
      {panel?.mode === 'edit'         && <EditPanel   collKey={panel.key}   onClose={closePanel} />}
      {panel?.mode === 'delete'       && <DeletePanel collKey={panel.key}   onClose={closePanel} />}
      {panel?.mode === 'relationship' && (
        <RelationshipPanel
          sourceKey={panel.sourceKey}
          targetKey={panel.targetKey}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
    </>
  )
}
