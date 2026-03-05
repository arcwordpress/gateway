import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { appConfig } from '../config'
import { useApp } from '../context/app'
import {
  COLLECTIONS_GRAPH_NODE_TYPES,
  layoutWithDagre,
} from '../components/graph_node_types'

// ─── Types ─────────────────────────────────────────────────────────────────

type Extension = {
  id: number
  key: string
  title: string
  description: string
  status: string
}

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
  extension_id: number | null
  relationships: Relationship[] | null
}

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit';         key: string }
  | { mode: 'delete';       key: string }
  | { mode: 'relationship'; sourceKey: string; targetKey: string }
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

function CreatePanel({ onClose, activeExtensionId }: { onClose: () => void; activeExtensionId: number | null }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const [extensionId, setExtensionId] = useState<number | null>(activeExtensionId)
  const key = toKey(title)

  const { data: extensions } = useQuery<Extension[]>({
    queryKey: ['raptor-extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.extensions as Extension[]
    },
  })

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
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Extension <span className="text-red-400">*</span>
          </label>
          <select
            value={extensionId ?? ''}
            onChange={(e) => setExtensionId(e.target.value ? Number(e.target.value) : null)}
            disabled={mutation.isPending}
            className={baseInput}
          >
            <option value="">Select an extension...</option>
            {extensions?.map((ext) => (
              <option key={ext.id} value={ext.id}>
                {ext.title}
              </option>
            ))}
          </select>
        </div>

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
        id:         crypto.randomUUID(),
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
          background: '#0f172a',
          borderRadius: 6,
          border: '1px solid #1e293b',
        }}
      >
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{sourceTitle}</span>
        <span style={{ fontSize: 12, color: '#475569' }}>→</span>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{targetTitle}</span>
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
          <label className="block text-xs font-medium text-gray-400 mb-2">
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
                  border: `1px solid ${type === rt.value ? '#3b82f6' : '#1e293b'}`,
                  background: type === rt.value ? '#1e3a5f' : '#0f172a',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="relType"
                  value={rt.value}
                  checked={type === rt.value}
                  onChange={() => setType(rt.value)}
                  style={{ marginTop: 2, accentColor: '#3b82f6' }}
                />
                <div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{rt.label}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{rt.hint}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Method name */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
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
          <p className="mt-1 text-[10px] text-gray-600">camelCase PHP method on the source model</p>
        </div>

        {/* Foreign key */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Foreign Key</label>
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
          <label className="block text-xs font-medium text-gray-400 mb-1">Owner Key</label>
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
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Add Relationship'}
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

// ─── Collections graph ────────────────────────────────────────────────────────

export default function CollectionsViewer() {
  const navigate = useNavigate()
  const [panel, setPanel] = useState<PanelState>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [canvasHost, setCanvasHost] = useState<HTMLElement | null>(null)
  const [activeExtensionId, setActiveExtensionId] = useState<number | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  
  useEffect(() => { setCanvasHost(document.getElementById('gateway-raptor-canvas-host')) }, [])

  // Try to get active extension from URL params if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const extId = params.get('extensionId')
    if (extId) setActiveExtensionId(Number(extId))
  }, [])

  const { data: extensions } = useQuery<Extension[]>({
    queryKey: ['raptor-extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.extensions as Extension[]
    },
  })

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
  })

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }, [])
  const openCreate = useCallback(() => {
    setPanel({ mode: 'create' })
  }, [])
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
    const exts = extensions ?? []

    // Hierarchy nodes / edges (used for Dagre layout)
    const hierarchyNodes: Node[] = []
    const hierarchyEdges: Edge[] = []

    // Add extension nodes as root nodes, then their collections below
    for (const ext of exts) {
      const extId = `ext-${ext.id}`
      const isActive = activeExtensionId === ext.id
      const collGroupId = `coll-group-${ext.id}`

      // Add extension as root
      hierarchyNodes.push({
        id: extId,
        type: 'extensionNode',
        data: { title: ext.title, extKey: ext.key, isActive, onManage: () => navigate({ to: '/extensions' }) },
        position: { x: 0, y: 0 },
      })

      // Add collections group node
      hierarchyNodes.push({
        id: collGroupId,
        type: 'collectionsGroupNode',
        data: {
          isExpanded: expandedGroups.has(collGroupId),
          onToggle: () => toggleGroup(collGroupId),
          onCreate: () => openCreate(),
        },
        position: { x: 0, y: 0 },
      })
      hierarchyEdges.push({
        id: `e-${extId}-coll-group`,
        source: extId,
        target: collGroupId,
        style: { stroke: '#4b5563' },
      })

      // Only add collections if group is expanded
      if (expandedGroups.has(collGroupId)) {
        for (const col of cols.filter((c) => c.extension_id === ext.id)) {
          const colId = `col-${col.collection_key}`
          const colIsActive = activeExtensionId === col.extension_id

          hierarchyNodes.push({
            id: colId,
            type: 'collectionNode',
            data: {
              title: col.title,
              collKey: col.collection_key,
              isActive: colIsActive,
              onEdit: () => openEdit(col.collection_key),
              onDelete: () => openDelete(col.collection_key),
            },
            position: { x: 0, y: 0 },
          })

          hierarchyEdges.push({
            id: `e-coll-group-${col.collection_key}`,
            source: collGroupId,
            target: colId,
            style: { stroke: colIsActive ? '#06b6d4' : '#16a34a' },
          })
        }
      }
    }

    // Relationship edges — drawn between collection nodes via side handles
    const relEdges: Edge[] = []
    for (const col of cols) {
      for (const rel of col.relationships ?? []) {
        const srcId = `col-${rel.source}`
        const tgtId = `col-${rel.target}`
        relEdges.push({
          id:             `rel-${rel.id}`,
          source:         srcId,
          target:         tgtId,
          sourceHandle:   'right',
          label:          `${rel.type}: ${rel.methodName}`,
          labelStyle:     { fill: '#64748b', fontSize: 10 },
          style:          { stroke: '#4f6a8a', strokeDasharray: '5 3' },
          type:           'straight',
        })
      }
    }

    setNodes(layoutWithDagre(hierarchyNodes, hierarchyEdges))
    setEdges([...hierarchyEdges, ...relEdges])
  }, [collections, extensions, activeExtensionId, expandedGroups, openCreate, openEdit, openDelete, toggleGroup, setNodes, setEdges])

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
            nodeTypes={COLLECTIONS_GRAPH_NODE_TYPES}
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
        </div>,
        canvasHost
      )}

      {panel?.mode === 'create'       && <CreatePanel activeExtensionId={activeExtensionId} onClose={closePanel} />}
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
