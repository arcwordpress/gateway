import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useNodesState, useEdgesState,
  type Node, type Edge, type NodeProps, type NodeTypes,
  Handle, Position,
} from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS-only package; declarations in src/types.d.ts
import { ControlledForm, useFieldType } from '@arcwp/gateway-forms'
import '@arcwp/gateway-forms/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { fieldsRoute } from '../router'
import { useApp } from '../context/app'
import { appConfig } from '../config'

// ─── Types ────────────────────────────────────────────────────────────────────

type Field = {
  id: number
  name: string
  type: string
  label: string
  sort_order: number
  config?: Record<string, unknown>
}

type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  field_list: { id: number; fields: Field[] } | null
}

type SurfaceState =
  | { mode: 'deleteConfirm'; field: Field }
  | { mode: 'editField'; field: Field }
  | null

// Field type definition shape returned by gateway/v1/field-types
type FieldTypeDef = {
  type: string
  fields: { name: string; label: string; type: string; required?: boolean; default?: unknown; description?: string; placeholder?: string; group?: string }[]
}

// ─── Field type helpers ───────────────────────────────────────────────────────

// "date-picker" → "Date Picker"
function formatFieldTypeLabel(type: string): string {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ─── TabbedFieldConfig ────────────────────────────────────────────────────────

// Renders a single field via the forms-package registry (same as ControlledFieldRenderer inside ControlledForm)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FieldRenderer = ({ config }: { config: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { Input } = (useFieldType as any)(config)
  return <Input config={config} />
}

// Wraps ControlledForm with optional tab navigation derived from field `group` annotations.
// Falls back to a flat list when all fields share a single group (or none are annotated).
function TabbedFieldConfig({
  fields,
  values,
  onChange,
}: {
  fields: FieldTypeDef['fields']
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
}) {
  const groups: Record<string, FieldTypeDef['fields']> = {}
  for (const field of fields) {
    const g = field.group ?? 'general'
    ;(groups[g] ??= []).push(field)
  }
  const groupKeys = Object.keys(groups)
  const [activeTab, setActiveTab] = useState(groupKeys[0] ?? 'general')

  const visibleFields = groupKeys.length > 1 ? (groups[activeTab] ?? []) : fields

  return (
    <ControlledForm values={values} onChange={onChange}>
      {groupKeys.length > 1 && (
        <div className="flex gap-1 mb-4 border-b border-gray-700">
          {groupKeys.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveTab(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                activeTab === g
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {g.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}
      {visibleFields.map(f =>
        !f.name || !f.type ? null : <FieldRenderer key={f.name} config={f} />
      )}
    </ControlledForm>
  )
}

// ─── Collection context ───────────────────────────────────────────────────────

type CollectionContextValue = {
  collection: Collection | undefined
  isLoading: boolean
  isError: boolean
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

export const useCollection = () => {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used inside CollectionProvider')
  return ctx
}

function CollectionProvider({ collectionKey, children }: { collectionKey: string; children: React.ReactNode }) {
  const { data: collection, isLoading, isError } = useQuery<Collection>({
    queryKey: ['raptor-collections', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collectionKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as Collection
    },
    enabled: !!collectionKey,
  })

  return (
    <CollectionContext.Provider value={{ collection, isLoading, isError }}>
      {children}
    </CollectionContext.Provider>
  )
}

// ─── Fields context ───────────────────────────────────────────────────────────

const FieldsContext = createContext<{
  fields: Field[]
  addField: (field: Field) => void
  moveField: (name: string, dir: 'up' | 'down') => void
  deleteField: (name: string) => void
  updateField: (oldName: string, updates: Partial<Field>) => void
} | null>(null)

const useFields = () => {
  const ctx = useContext(FieldsContext)
  if (!ctx) throw new Error('useFields must be used within FieldsProvider')
  return ctx
}

function FieldsProvider({ children }: { children: React.ReactNode }) {
  const { collection } = useCollection()
  const [fields, setFields] = useState<Field[]>([])

  // Initialise (and re-sync) from server whenever the collection query settles.
  useEffect(() => {
    setFields(collection?.field_list?.fields ?? [])
  }, [collection])

  const addField = (field: Field) =>
    setFields((prev) => [...prev, field])

  const moveField = (name: string, dir: 'up' | 'down') =>
    setFields((prev) => {
      const i = prev.findIndex((f) => f.name === name)
      if (dir === 'up' && i === 0) return prev
      if (dir === 'down' && i === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? i - 1 : i + 1
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next
    })

  const deleteField = (name: string) =>
    setFields((prev) => prev.filter((f) => f.name !== name))

  const updateField = (oldName: string, updates: Partial<Field>) =>
    setFields((prev) => prev.map((f) => f.name === oldName ? { ...f, ...updates } : f))

  return (
    <FieldsContext.Provider value={{ fields, addField, moveField, deleteField, updateField }}>
      {children}
    </FieldsContext.Provider>
  )
}

// ─── Graph types ─────────────────────────────────────────────────────────────

type AdminCollectionInfo = {
  key: string
  title: string
  table: string
  record_count: number
  routes: { type: string; method: string; route: string }[]
}

type CollRootNodeData    = Node<{ title: string; collKey: string }, 'collectionRootNode'>
type DbNodeData          = Node<{ tableName: string; recordCount: number | null }, 'databaseNode'>
type RecordsStatus       = 'idle' | 'loading' | 'empty' | 'loaded' | 'no-route'
type RecordsContNodeData = Node<{ count: number }, 'recordsContainerNode'>
type RecordNodeData      = Node<{ recordId: number | string; label: string }, 'recordNode'>

type JsonSchemaProp = { name: string; type: string; format?: string; description?: string; required: boolean }
type SchemaNodeData  = Node<{ title: string; properties: JsonSchemaProp[] }, 'jsonSchemaNode'>

// Context so node components can read live records state without going through
// React Flow's node data (which freezes function references).
type RecordsCtxValue = { status: RecordsStatus; count: number; onRefresh: () => void }
const RecordsCtx = createContext<RecordsCtxValue>({ status: 'idle', count: 0, onRefresh: () => {} })

// ─── Custom node: Collection root ─────────────────────────────────────────────

function CollectionRootNode({ data }: NodeProps<CollRootNodeData>) {
  return (
    <div
      style={{
        background: '#1e3a5f',
        border: '1px solid #3b82f6',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#dbeafe',
        fontSize: 13,
        fontWeight: 600,
        minWidth: 160,
        textAlign: 'center',
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', marginBottom: 4 }}>
        Collection
      </div>
      <div>{data.title}</div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#60a5fa', marginTop: 3, fontWeight: 400 }}>
        {data.collKey}
      </div>
    </div>
  )
}

// ─── Custom node: Database ────────────────────────────────────────────────────

function DatabaseNode({ data }: NodeProps<DbNodeData>) {
  return (
    <div
      style={{
        background: '#1a2e1a',
        border: '1px solid #22c55e',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#dcfce7',
        fontSize: 12,
        minWidth: 200,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ade80', marginBottom: 6, fontWeight: 600 }}>
        Database Table
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#86efac', wordBreak: 'break-all' }}>
        {data.tableName}
      </div>
      {data.recordCount !== null && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>
          {data.recordCount.toLocaleString()} record{data.recordCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ─── Custom node: Records container ──────────────────────────────────────────

function RecordsContainerNode(_: NodeProps<RecordsContNodeData>) {
  // Read live state from context — not from node data, which would freeze the
  // function reference and give stale status after the first render.
  const { status, count, onRefresh } = useContext(RecordsCtx)

  const statusLine: { text: string; color: string } = {
    idle:     { text: 'not loaded',      color: '#57534e' },
    loading:  { text: 'loading…',        color: '#a8a29e' },
    empty:    { text: '0 records found', color: '#78716c' },
    loaded:   { text: `${count} loaded`, color: '#86efac' },
    'no-route': { text: 'no API route',  color: '#b45309' },
  }[status]

  const isDisabled = status === 'loading' || status === 'no-route'

  return (
    <div
      style={{
        background: '#1c1917',
        border: '1px solid #78716c',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#d6d3d1',
        fontSize: 12,
        minWidth: 150,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a8a29e', marginBottom: 4, fontWeight: 600 }}>
        Records
      </div>
      <div style={{ fontSize: 11, color: statusLine.color, marginBottom: 8 }}>
        {statusLine.text}
      </div>
      <button
        onClick={onRefresh}
        disabled={isDisabled}
        style={{
          background: 'none',
          border: `1px solid ${isDisabled ? '#3c3834' : '#57534e'}`,
          borderRadius: 4,
          color: isDisabled ? '#3c3834' : '#a8a29e',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '2px 8px',
          cursor: isDisabled ? 'default' : 'pointer',
        }}
      >
        REFRESH
      </button>
    </div>
  )
}

// ─── Custom node: Individual record ──────────────────────────────────────────

function RecordNode({ data }: NodeProps<RecordNodeData>) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#94a3b8',
        fontSize: 11,
        minWidth: 110,
        maxWidth: 160,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>
        #{data.recordId}
      </div>
      <div style={{ color: '#cbd5e1', wordBreak: 'break-word' }}>
        {data.label}
      </div>
    </div>
  )
}

// ─── Custom node: JSON Schema ─────────────────────────────────────────────────

const TYPE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  string:  { bg: '#1e3a5f', text: '#93c5fd' },
  number:  { bg: '#1a2e1a', text: '#4ade80' },
  integer: { bg: '#1a2e1a', text: '#4ade80' },
  boolean: { bg: '#2d1b4e', text: '#c084fc' },
  array:   { bg: '#1c1917', text: '#fb923c' },
  object:  { bg: '#1c1917', text: '#fbbf24' },
}

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_BADGE_COLORS[type] ?? { bg: '#1e293b', text: '#94a3b8' }
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
      padding: '1px 5px', borderRadius: 4, letterSpacing: '0.03em',
    }}>
      {type}
    </span>
  )
}

function JsonSchemaNode({ data }: NodeProps<SchemaNodeData>) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #4b5563',
      borderRadius: 10,
      minWidth: 220,
      maxWidth: 280,
      fontSize: 11,
      color: '#d1d5db',
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div style={{
        background: '#1f2937', borderBottom: '1px solid #374151',
        padding: '8px 12px',
      }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 2 }}>
          JSON Schema
        </div>
        <div style={{ fontWeight: 600, color: '#f9fafb', fontSize: 12 }}>{data.title}</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, fontFamily: 'monospace' }}>
          type: <span style={{ color: '#fbbf24' }}>object</span>
        </div>
      </div>

      {/* Properties */}
      <div style={{ padding: '6px 0' }}>
        {data.properties.length === 0 ? (
          <div style={{ padding: '6px 12px', color: '#4b5563', fontStyle: 'italic' }}>no fields defined</div>
        ) : (
          data.properties.map(prop => (
            <div key={prop.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '3px 12px', gap: 8,
            }}>
              <span style={{ fontFamily: 'monospace', color: prop.required ? '#e5e7eb' : '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {prop.required && <span style={{ color: '#ef4444', marginRight: 3 }}>*</span>}
                {prop.name}
              </span>
              <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                <TypeBadge type={prop.type} />
                {prop.format && <TypeBadge type={prop.format} />}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer: built-in id field */}
      <div style={{ borderTop: '1px solid #1f2937', padding: '4px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', color: '#4b5563' }}>id</span>
        <TypeBadge type="integer" />
      </div>
    </div>
  )
}

// ─── Node types registry ──────────────────────────────────────────────────────

const FIELD_GRAPH_NODE_TYPES: NodeTypes = {
  collectionRootNode:   CollectionRootNode,
  databaseNode:         DatabaseNode,
  recordsContainerNode: RecordsContainerNode,
  recordNode:           RecordNode,
  jsonSchemaNode:       JsonSchemaNode,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Best-effort label for a record: first string-ish value that's not 'id'. */
function recordLabel(record: Record<string, unknown>): string {
  const skipKeys = new Set(['id', 'created_at', 'updated_at', 'deleted_at'])
  for (const [k, v] of Object.entries(record)) {
    if (skipKeys.has(k)) continue
    if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 40)
    if (typeof v === 'number') return String(v)
  }
  return `ID ${record['id'] ?? '?'}`
}

/** Convert a collection's fields into JSON Schema property descriptors on-the-fly. */
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
        // stays string
        break
    }

    return { name: f.name, type, format, required: false }
  })
}

// ─── Graph ────────────────────────────────────────────────────────────────────

function Graph() {
  const { collection } = useCollection()
  const { fields }     = useFields()
  const collKey = collection?.collection_key ?? ''

  // Fetch admin-data to find the DB table name + record count for this collection.
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

  // Derive the get_many route from admin-data if available.
  const getManyRoute = adminData?.routes.find(r => r.type === 'get_many')?.route ?? null

  // fetchTrigger drives lazy records loading: 0 = never fetched, increments on each REFRESH.
  // Using it in the queryKey means every increment is treated as a distinct cache entry,
  // so React Query always fires a new request regardless of prior state.
  const [fetchTrigger, setFetchTrigger] = useState(0)
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

  // ── Layout constants ──────────────────────────────────────────────────────
  // Collection root sits centre-top.  Database branches left, schema branches
  // right at the same depth.  Records + individual record nodes sit below db.

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

  // Re-sync nodes/edges whenever the underlying data changes.
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

// ─── Collection name ──────────────────────────────────────────────────────────

function CollectionName() {
  const { collection, isLoading } = useCollection()
  if (isLoading) return <div className="h-5 w-32 rounded bg-gray-700 animate-pulse" />
  return <h1 className="!text-neutral-300 text-2xl font-bold">{collection?.title}</h1>
}

// ─── Editor / FieldsList ──────────────────────────────────────────────────────

function Editor({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  return (
    <section className="text-white">
      <FieldsList setEditSurface={setEditSurface} />
    </section>
  )
}

function FieldsList({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  const { fields, addField, moveField } = useFields()
  const { collection } = useCollection()
  const queryClient = useQueryClient()
  const collectionKey = collection?.collection_key
  const fieldListId   = collection?.field_list?.id

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; label: string; sort_order: number }) => {
      const res = await fetch(apiUrl('gateway/v1/raptor/field'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ field_list_id: fieldListId, ...data }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create field')
      return json.field as Field
    },
    onSuccess: (field) => {
      addField(field)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
    },
  })

  return (
    <section>
      <header className="flex justify-between items-center gap-6 mb-10">
        <h2 className="!text-white text-xl font-medium">Field List</h2>
        <button
          className="text-3xl disabled:opacity-50"
          disabled={addMutation.isPending || !fieldListId}
          onClick={() => addMutation.mutate({ name: `field_${fields.length}`, type: 'text', label: 'New Field', sort_order: fields.length })}
        >+</button>
      </header>
      {!fieldListId && (
        <p className="mb-6 text-xs text-amber-400">
          This is very unusual, this Collection does not have a Field List row associated with it.
        </p>
      )}
      {addMutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(addMutation.error as Error).message}
        </div>
      )}
      <ul className="min-w-96">
        {fields.map((field) => (
          <li className="group relative flex gap-8 border border-1 border-white px-4 py-2" key={field.name}>
            <div>HANDLE</div>
            <h3 className="basis-1/2 !text-white">{field.label}</h3>
            <div className="basis-1/2 opacity-0 group-hover:opacity-100 flex gap-2">
              <button
                disabled={addMutation.isPending}
                onClick={() => addMutation.mutate({ name: `field_${fields.length}`, type: 'text', label: 'New Field', sort_order: fields.length })}
              >+</button>
              <button
                disabled={addMutation.isPending}
                onClick={() => addMutation.mutate({ name: `${field.name}_copy`, type: field.type, label: field.label, sort_order: fields.length })}
              >Copy</button>
              <button onClick={() => moveField(field.name, 'up')}>Up</button>
              <button onClick={() => moveField(field.name, 'down')}>Down</button>
              <button onClick={() => setEditSurface({ mode: 'editField', field })}>Edit</button>
              <button onClick={() => setEditSurface({ mode: 'deleteConfirm', field })}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Edit panel / Delete confirmation ────────────────────────────────────────

function usePanelGeometry() {
  const { isExpanded } = useApp()
  const constrained = appConfig.isWordPress && !isExpanded
  return {
    top:    constrained ? 32  : 0,
    height: constrained ? 'calc(100vh - 32px)' : '100vh',
  }
}

function EditPanel({ title, sub, onClose, children }: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
}) {
  const { top, height } = usePanelGeometry()
  return (
    <div style={{
      position: 'fixed', right: 0, top, height, width: 320,
      background: '#0f0f0f', borderLeft: '1px solid #1e293b',
      zIndex: 100000, display: 'flex', flexDirection: 'column', color: 'white',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{sub}</div>}
        </div>
        <button onClick={onClose} aria-label="Close panel" style={{
          color: '#64748b', fontSize: 18, lineHeight: 1,
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>✕</button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm'

// ─── FieldEditForm ────────────────────────────────────────────────────────────

function FieldEditForm({ field, onClose }: { field: Field; onClose: () => void }) {
  const { updateField } = useFields()
  const { collection }  = useCollection()
  const queryClient     = useQueryClient()
  const [name, setName]   = useState(field.name)
  const [type, setType]   = useState(field.type)
  const [label, setLabel] = useState(field.label)
  const [extras, setExtras] = useState<Record<string, unknown>>(field.config ?? {})

  const handleExtrasChange = useCallback(
    (name: string, value: unknown) => setExtras(prev => ({ ...prev, [name]: value })),
    []
  )

  // Load all registered field types (cached for the session)
  const { data: fieldTypeDefs, isLoading: typesLoading } = useQuery<FieldTypeDef[]>({
    queryKey: ['field-types'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/field-types'), { headers: authHeaders() })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to load field types')
      return json.data as FieldTypeDef[]
    },
    staleTime: Infinity,
  })

  const selectedTypeDef = fieldTypeDefs?.find(ft => ft.type === type)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/field/${field.id}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name, type, label, config: extras }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update field')
      return json.field as Field
    },
    onSuccess: (updated) => {
      updateField(field.name, updated)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
               className={baseInput} required disabled={mutation.isPending} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className={baseInput}
          disabled={mutation.isPending || typesLoading}
        >
          {typesLoading && <option value={type}>{formatFieldTypeLabel(type)}</option>}
          {fieldTypeDefs?.map(ft => (
            <option key={ft.type} value={ft.type}>{formatFieldTypeLabel(ft.type)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Label</label>
        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
               className={baseInput} required disabled={mutation.isPending} />
      </div>

      {/* Type-specific configuration via the real forms package */}
      {selectedTypeDef && selectedTypeDef.fields.length > 0 && (
        <div className="pt-3 border-t border-gray-800">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Field Configuration
          </div>
          <TabbedFieldConfig
            fields={selectedTypeDef.fields}
            values={extras}
            onChange={handleExtrasChange}
          />
        </div>
      )}

      {mutation.isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button type="submit"
                disabled={mutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onClose}
                disabled={mutation.isPending}
                className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors disabled:opacity-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── DeleteConfirmation ───────────────────────────────────────────────────────

function DeleteConfirmation({ field, onClose }: { field: Field; onClose: () => void }) {
  const { deleteField } = useFields()
  const { collection }  = useCollection()
  const queryClient     = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/field/${field.id}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete field')
    },
    onSuccess: () => {
      deleteField(field.name)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-300 text-sm">Delete <strong className="text-white">{field.label}</strong>?</p>
      {mutation.isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <section className="flex gap-6 border border-neutral-600 px-6 py-3 rounded mb-12">
      <a href="https://arcwp.ca/docs">DOCS</a>
      <a href="https://arcwp.ca/support">SUPPORT</a>
    </section>
  )
}

// ─── Files ────────────────────────────────────────────────────────────────────

function Files() {
  return (
    <div>
      <h2 className="!text-white text-xl font-medium mb-6">Output Files</h2>
      <article>
        <ul>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Event.php</h3>
          </li>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Migrate.php</h3>
          </li>
        </ul>
      </article>
    </div>
  )
}

// ─── Inner page (renders after collection resolves) ───────────────────────────

function FieldsContent({ editSurface, setEditSurface }: {
  editSurface: SurfaceState
  setEditSurface: (s: SurfaceState) => void
}) {
  const { isLoading, isError } = useCollection()

  if (isLoading) return <div className="p-8 text-gray-400">Loading collection…</div>
  if (isError)   return <div className="p-8 text-red-400">Failed to load collection.</div>

  return (
    <section className="text-white px-12">
      <TopBar />
      <div>
        <h4 className="font-medium mb-2">COLLECTION</h4>
        <CollectionName />
      </div>
      <div className="flex space-between items-start mt-12">
        <div className="flex flex-col gap-8">
          <Editor setEditSurface={setEditSurface} />
          <Files />
        </div>
        <Graph />
      </div>

      {editSurface && (
        <EditPanel
          title={editSurface.mode === 'editField' ? 'Edit Field' : 'Delete Field'}
          sub={editSurface.field.name}
          onClose={() => setEditSurface(null)}
        >
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
          {editSurface.mode === 'editField' && (
            <FieldEditForm field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
        </EditPanel>
      )}
    </section>
  )
}

/*************************/
/* FIELDS DEFAULT RENDER */
/*************************/

export default function Fields() {
  const { key } = fieldsRoute.useParams()
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <CollectionProvider collectionKey={key}>
      <FieldsProvider>
        <FieldsContent editSurface={editSurface} setEditSurface={setEditSurface} />
      </FieldsProvider>
    </CollectionProvider>
  )
}
