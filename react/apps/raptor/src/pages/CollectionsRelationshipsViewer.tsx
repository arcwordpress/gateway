import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { useApp } from '../context/app'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { CollectionNode } from '../components/graph_node_types'
import { layoutWithDagre } from '../components/graph_node_types'
import type { NodeTypes } from '@xyflow/react'
import type { CollNodeType } from '../components/graph_node_types'

// ─── Types ──────────────────────────────────────────────────────────────────

type RelType = 'belongsTo' | 'hasMany' | 'hasOne' | 'belongsToMany'

type Relationship = {
  id: string
  source: string
  target: string
  type: RelType
  methodName: string
  foreignKey: string
  ownerKey: string
  pivotTable?: string
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
  | { mode: 'create'; sourceKey: string; targetKey: string }
  | { mode: 'edit';   rel: Relationship }
  | null

// ─── Naming inference ────────────────────────────────────────────────────────

function toCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function toPlural(word: string): string {
  if (word.endsWith('s')) return word
  return word + 's'
}

function inferDefaults(
  type: RelType,
  sourceKey: string,
  targetKey: string,
): { methodName: string; foreignKey: string; ownerKey: string; pivotTable: string } {
  const src = toCamel(sourceKey)
  const tgt = toCamel(targetKey)

  switch (type) {
    case 'belongsTo':
      return {
        methodName: tgt,
        foreignKey: `${targetKey}_id`,
        ownerKey:   'id',
        pivotTable: '',
      }
    case 'hasMany':
      return {
        methodName: toPlural(tgt),
        foreignKey: `${sourceKey}_id`,
        ownerKey:   'id',
        pivotTable: '',
      }
    case 'hasOne':
      return {
        methodName: tgt,
        foreignKey: `${sourceKey}_id`,
        ownerKey:   'id',
        pivotTable: '',
      }
    case 'belongsToMany': {
      // Alphabetical pivot: post_tag (not tag_post)
      const [a, b] = [sourceKey, targetKey].sort()
      // Strip trailing 's' for pivot name if present
      const aS = a.replace(/s$/, '')
      const bS = b.replace(/s$/, '')
      return {
        methodName: toPlural(tgt),
        foreignKey: `${sourceKey}_id`,
        ownerKey:   'id',
        pivotTable: `${aS}_${bS}`,
      }
    }
    default:
      return { methodName: '', foreignKey: '', ownerKey: 'id', pivotTable: '' }
  }
}

// ─── Node type registry (only collectionNode needed here) ────────────────────

const NODE_TYPES: NodeTypes = {
  collectionNode: CollectionNode as React.ComponentType<never>,
}

// ─── Panel geometry ──────────────────────────────────────────────────────────

function usePanelGeometry() {
  const { shellTopOffset, shellHeightCss } = useApp()
  return { top: shellTopOffset, height: shellHeightCss }
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
        width: 340,
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

// ─── Shared styles ───────────────────────────────────────────────────────────

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm'

// ─── Relationship type options ───────────────────────────────────────────────

const REL_TYPES: { value: RelType; label: string; hint: string }[] = [
  { value: 'belongsTo',     label: 'Belongs To',       hint: 'Source has the FK → points to target (e.g. post belongsTo user)' },
  { value: 'hasMany',       label: 'Has Many',         hint: 'Target has the FK → source owns many (e.g. user hasMany posts)' },
  { value: 'hasOne',        label: 'Has One',          hint: 'Target has the FK → source owns one (e.g. user hasOne profile)' },
  { value: 'belongsToMany', label: 'Belongs To Many',  hint: 'Many-to-many via a pivot table (e.g. post belongsToMany tags)' },
]

// ─── Relationship form (shared by Create and Edit) ───────────────────────────

function RelationshipForm({
  sourceKey,
  targetKey,
  collections,
  initial,
  onSave,
  onDelete,
  isPending,
  isError,
  errorMessage,
}: {
  sourceKey: string
  targetKey: string
  collections: Collection[]
  initial?: Relationship
  onSave: (rel: Omit<Relationship, 'id' | 'source' | 'target'>) => void
  onDelete?: () => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
}) {
  const [type, setType] = useState<RelType>(initial?.type ?? 'belongsTo')
  const inferredRef = useRef(false)
  const defaults = inferDefaults(type, sourceKey, targetKey)

  const [methodName,  setMethodName]  = useState(initial?.methodName  ?? defaults.methodName)
  const [foreignKey,  setForeignKey]  = useState(initial?.foreignKey  ?? defaults.foreignKey)
  const [ownerKey,    setOwnerKey]    = useState(initial?.ownerKey    ?? defaults.ownerKey)
  const [pivotTable,  setPivotTable]  = useState(initial?.pivotTable  ?? defaults.pivotTable)

  // When type changes (and it's not the initial render in edit mode), re-infer defaults
  useEffect(() => {
    if (initial && !inferredRef.current) {
      inferredRef.current = true
      return
    }
    const d = inferDefaults(type, sourceKey, targetKey)
    setMethodName(d.methodName)
    setForeignKey(d.foreignKey)
    setOwnerKey(d.ownerKey)
    setPivotTable(d.pivotTable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const sourceTitle = collections.find((c) => c.collection_key === sourceKey)?.title ?? sourceKey
  const targetTitle = collections.find((c) => c.collection_key === targetKey)?.title ?? targetKey

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!methodName.trim()) return
        onSave({ type, methodName: methodName.trim(), foreignKey: foreignKey.trim(), ownerKey: ownerKey.trim() || 'id', pivotTable: pivotTable.trim() || undefined })
      }}
      className="space-y-5"
    >
      {/* Source → Target */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: '#18181b',
          borderRadius: 6,
          border: '1px solid #1e293b',
        }}
      >
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>{sourceTitle}</span>
        <span style={{ fontSize: 12, color: '#52525b' }}>→</span>
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>{targetTitle}</span>
      </div>

      {/* Type */}
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
                background: type === rt.value ? '#3f3f46' : '#18181b',
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
          autoFocus={!initial}
          disabled={isPending}
          placeholder={defaults.methodName}
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
          disabled={isPending}
          placeholder={defaults.foreignKey}
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
          disabled={isPending}
          placeholder="id"
          onChange={(e) => setOwnerKey(e.target.value)}
          className={baseInput}
        />
      </div>

      {/* Pivot table (belongsToMany only) */}
      {type === 'belongsToMany' && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Pivot Table</label>
          <input
            type="text"
            value={pivotTable}
            disabled={isPending}
            placeholder={defaults.pivotTable}
            onChange={(e) => setPivotTable(e.target.value)}
            className={baseInput}
          />
          <p className="mt-1 text-[10px] text-zinc-600">Defaults to alphabetical join of the two collection keys</p>
        </div>
      )}

      {isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {errorMessage ?? 'Something went wrong.'}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending || !methodName.trim()}
          className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
        >
          {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Add Relationship'}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="px-4 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-700 disabled:opacity-50 text-red-300 text-xs font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}

// ─── Create panel ─────────────────────────────────────────────────────────────

function CreatePanel({
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

  const mutation = useMutation({
    mutationFn: async (fields: Omit<Relationship, 'id' | 'source' | 'target'>) => {
      // Fetch current relationships for source collection
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${sourceKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const existing: Relationship[] = json.collection?.relationships ?? []

      const newRel: Relationship = {
        id:     crypto.randomUUID(),
        source: sourceKey,
        target: targetKey,
        ...fields,
      }

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${sourceKey}`), {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ relationships: [...existing, newRel] }),
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
    <PanelShell title="New Relationship" sub={`${sourceKey} → ${targetKey}`} onClose={onClose}>
      <RelationshipForm
        sourceKey={sourceKey}
        targetKey={targetKey}
        collections={collections}
        onSave={(fields) => mutation.mutate(fields)}
        isPending={mutation.isPending}
        isError={mutation.isError}
        errorMessage={(mutation.error as Error | null)?.message}
      />
    </PanelShell>
  )
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

function EditPanel({
  rel,
  collections,
  onClose,
}: {
  rel: Relationship
  collections: Collection[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (fields: Omit<Relationship, 'id' | 'source' | 'target'>) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const existing: Relationship[] = json.collection?.relationships ?? []

      const updated = existing.map((r) =>
        r.id === rel.id ? { ...r, ...fields } : r,
      )

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ relationships: updated }),
      })
      const patchJson = await patchRes.json()
      if (!patchJson.success) throw new Error(patchJson.message ?? 'Failed to update relationship')
      return patchJson
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const existing: Relationship[] = json.collection?.relationships ?? []

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ relationships: existing.filter((r) => r.id !== rel.id) }),
      })
      const patchJson = await patchRes.json()
      if (!patchJson.success) throw new Error(patchJson.message ?? 'Failed to delete relationship')
      return patchJson
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  const isPending = saveMutation.isPending || deleteMutation.isPending

  return (
    <PanelShell title="Edit Relationship" sub={`${rel.source} → ${rel.target}`} onClose={onClose}>
      <RelationshipForm
        sourceKey={rel.source}
        targetKey={rel.target}
        collections={collections}
        initial={rel}
        onSave={(fields) => saveMutation.mutate(fields)}
        onDelete={() => deleteMutation.mutate()}
        isPending={isPending}
        isError={saveMutation.isError || deleteMutation.isError}
        errorMessage={
          ((saveMutation.error ?? deleteMutation.error) as Error | null)?.message
        }
      />
    </PanelShell>
  )
}

// ─── Main viewer ─────────────────────────────────────────────────────────────

export default function CollectionsRelationshipsViewer() {
  const [panel, setPanel] = useState<PanelState>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const rememberedPositions = useRef<Map<string, { x: number; y: number }>>(new Map())

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collections as Collection[]
    },
  })

  const closePanel = useCallback(() => setPanel(null), [])

  const onConnect = useCallback((connection: Connection) => {
    const srcId = connection.source ?? ''
    const tgtId = connection.target ?? ''
    if (!srcId.startsWith('col-') || !tgtId.startsWith('col-')) return
    setPanel({
      mode:      'create',
      sourceKey: srcId.replace(/^col-/, ''),
      targetKey: tgtId.replace(/^col-/, ''),
    })
  }, [])

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      // Edge ids are `rel-{relId}`, data is embedded in edge.data
      const relData = edge.data as Relationship | undefined
      if (!relData) return
      setPanel({ mode: 'edit', rel: relData })
    },
    [],
  )

  // Build nodes + edges whenever collections change
  useEffect(() => {
    const cols = collections ?? []

    const rawNodes: Node[] = cols.map((col) => ({
      id:       `col-${col.collection_key}`,
      type:     'collectionNode',
      data:     {
        title:    col.title,
        collKey:  col.collection_key,
        isActive: false,
      } satisfies CollNodeType['data'],
      position: { x: 0, y: 0 },
    }))

    // Use a sparse layout — only hierarchy edges drive Dagre, then relationship
    // edges are overlaid separately so they don't distort the layout.
    const laidOut = layoutWithDagre(rawNodes, [])

    setNodes((current) => {
      current.forEach((n) => rememberedPositions.current.set(n.id, n.position))
      return laidOut.map((n) => ({
        ...n,
        position: rememberedPositions.current.get(n.id) ?? n.position,
      }))
    })

    // Build relationship edges
    const relEdges: Edge[] = []
    for (const col of cols) {
      for (const rel of col.relationships ?? []) {
        const srcId = `col-${rel.source}`
        const tgtId = `col-${rel.target}`
        relEdges.push({
          id:           `rel-${rel.id}`,
          source:       srcId,
          target:       tgtId,
          sourceHandle: 'right',
          label:        `${rel.type}: ${rel.methodName}`,
          labelStyle:   { fill: '#a1a1aa', fontSize: 10 },
          style:        { stroke: '#52525b', strokeDasharray: '5 3', cursor: 'pointer' },
          type:         'default',
          data:         rel,
        })
      }
    }

    setEdges(relEdges)
  }, [collections, setNodes, setEdges])

  const activeRel = panel?.mode === 'edit' ? panel.rel : null
  const activeCreate = panel?.mode === 'create' ? panel : null

  return (
    <>
      {/* Hint overlay */}
      {(collections ?? []).length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center', color: '#52525b' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No collections yet</div>
            <div style={{ fontSize: 12 }}>Create Raptor Collections first, then return here to define relationships.</div>
          </div>
        </div>
      )}

      {(collections ?? []).length > 0 && nodes.length > 0 && edges.length === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 10,
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 8,
            padding: '8px 14px',
          }}
        >
          <div style={{ fontSize: 11, color: '#71717a', textAlign: 'center' }}>
            Drag a connector from one collection node to another to create a relationship
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
        <Controls position="top-right" style={{ marginTop: 8, marginRight: 16 }} />
        <SharedMiniMap />
      </ReactFlow>

      {activeCreate && (
        <CreatePanel
          sourceKey={activeCreate.sourceKey}
          targetKey={activeCreate.targetKey}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
      {activeRel && (
        <EditPanel
          rel={activeRel}
          collections={collections ?? []}
          onClose={closePanel}
        />
      )}
    </>
  )
}
