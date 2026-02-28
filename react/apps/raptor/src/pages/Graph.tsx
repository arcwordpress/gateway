import { useState, useCallback, useEffect } from 'react'
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
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { appConfig } from '../config'

// ─── Types ─────────────────────────────────────────────────────────────────

type Extension = { key: string; title: string }
type SchemaProperty = { type: string; title: string; description?: string; default?: string }
type FieldGroupSchema = {
  title: string
  description?: string
  required: string[]
  properties: Record<string, SchemaProperty>
}

type ExtensionNodeData = Node<{ title: string; extKey: string }, 'extensionNode'>
type ActionsNodeData = Node<{ onEdit: () => void; onDelete: () => void }, 'actionsNode'>

const fieldGroupSchemaUrl = appConfig.schemaUrl.replace(/[^/]+$/, 'field-group.json')

// ─── Custom node: Extension ─────────────────────────────────────────────────

function ExtensionNode({ data }: NodeProps<ExtensionNodeData>) {
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
      <div style={{ fontWeight: 500 }}>{data.title}</div>
      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
        {data.extKey}
      </div>
    </div>
  )
}

// ─── Custom node: Actions ───────────────────────────────────────────────────

function ActionsNode({ data }: NodeProps<ActionsNodeData>) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '5px 8px',
        display: 'flex',
        gap: 6,
      }}
    >
      <button
        onClick={data.onEdit}
        style={{
          fontSize: 11,
          padding: '3px 10px',
          background: '#1d4ed8',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        Edit
      </button>
      <button
        onClick={data.onDelete}
        style={{
          fontSize: 11,
          padding: '3px 10px',
          background: '#7f1d1d',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  extensionNode: ExtensionNode as React.ComponentType<NodeProps>,
  actionsNode: ActionsNode as React.ComponentType<NodeProps>,
}

// ─── Dagre layout ──────────────────────────────────────────────────────────

function layoutWithDagre(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 30 })

  nodes.forEach((n) => {
    const w = n.type === 'actionsNode' ? 142 : 180
    const h = n.type === 'actionsNode' ? 36 : 54
    g.setNode(n.id, { width: w, height: h })
  })
  edges.forEach((e) => g.setEdge(e.source, e.target))

  Dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    const w = n.type === 'actionsNode' ? 142 : 180
    const h = n.type === 'actionsNode' ? 36 : 54
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } }
  })
}

// ─── Edit panel ─────────────────────────────────────────────────────────────

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm'

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-20 rounded bg-gray-900 animate-pulse" />
      <div className="h-8 rounded-lg bg-gray-900 animate-pulse" />
    </div>
  )
}

function EditPanel({ extKey, onClose }: { extKey: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: schema, isLoading: schemaLoading } = useQuery<FieldGroupSchema>({
    queryKey: ['schema', 'field-group'],
    queryFn: async () => {
      const res = await fetch(fieldGroupSchemaUrl)
      if (!res.ok) throw new Error(`Failed to load schema (HTTP ${res.status})`)
      return res.json() as Promise<FieldGroupSchema>
    },
    staleTime: Infinity,
    retry: 2,
  })

  const {
    data: existing,
    isLoading: extLoading,
    isError: extError,
  } = useQuery<Record<string, string>>({
    queryKey: ['extensions', extKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${extKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extension as Record<string, string>
    },
    enabled: !!extKey,
  })

  useEffect(() => {
    if (!schema || !existing) return
    setFields(() => {
      const seeded: Record<string, string> = {}
      for (const name of Object.keys(schema.properties)) {
        seeded[name] = existing[name] ?? ''
      }
      return seeded
    })
  }, [schema, existing])

  const setField = (name: string, val: string) =>
    setFields((prev) => ({ ...prev, [name]: val }))

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${extKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${extKey}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      onClose()
    },
  })

  const isBusy = updateMutation.isPending || deleteMutation.isPending
  const isLoading = schemaLoading || extLoading
  const required: string[] = schema?.required ?? []
  const schemaEntries = schema ? Object.entries(schema.properties) : []

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: 320,
        background: '#000',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Panel header */}
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
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>
            {existing?.title || extKey}
          </div>
          <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginTop: 2 }}>
            {extKey}
          </div>
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

      {/* Form body */}
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {extError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            Could not load extension data.
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!fields.title?.trim()) return
            updateMutation.mutate({ ...fields })
          }}
          className="space-y-4"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <FieldSkeleton key={i} />)
            : schemaEntries.map(([name, prop]) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    {prop.title}
                    {required.includes(name) && <span className="ml-1 text-red-400">*</span>}
                    <span className="ml-1.5 text-gray-600 font-mono font-normal">{name}</span>
                  </label>
                  <input
                    type="text"
                    value={fields[name] ?? ''}
                    disabled={isBusy}
                    onChange={(e) => setField(name, e.target.value)}
                    className={baseInput}
                  />
                </div>
              ))}

          {updateMutation.isError && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {(updateMutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isBusy || !fields.title?.trim() || isLoading}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
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

        {/* Danger zone */}
        <div className="mt-6 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-xs font-medium text-red-400 mb-2">Danger zone</p>
          {deleteMutation.isError && (
            <p className="text-xs text-red-400 mb-2">
              {(deleteMutation.error as Error).message}
            </p>
          )}
          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={isBusy}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isBusy}
                className="px-3 py-1 rounded bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
            >
              Delete Extension
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Graph ──────────────────────────────────────────────────────────────────

export default function Graph() {
  const queryClient = useQueryClient()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const { data: extensions } = useQuery<Extension[]>({
    queryKey: ['extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/extensions'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extensions as Extension[]
    },
  })

  const handleEdit = useCallback((key: string) => setSelectedKey(key), [])

  const handleDelete = useCallback(
    (key: string) => {
      if (!window.confirm(`Delete extension "${key}"? This cannot be undone.`)) return
      void fetch(apiUrl(`gateway/v1/extensions/${key}`), {
        method: 'DELETE',
        headers: authHeaders(),
      }).then(() => queryClient.invalidateQueries({ queryKey: ['extensions'] }))
    },
    [queryClient],
  )

  useEffect(() => {
    if (!extensions) return

    const rawNodes: Node[] = []
    const rawEdges: Edge[] = []

    for (const ext of extensions) {
      const mainId = `ext-${ext.key}`
      const actId = `act-${ext.key}`

      rawNodes.push({
        id: mainId,
        type: 'extensionNode',
        data: { title: ext.title, extKey: ext.key },
        position: { x: 0, y: 0 },
      })
      rawNodes.push({
        id: actId,
        type: 'actionsNode',
        data: {
          onEdit: () => handleEdit(ext.key),
          onDelete: () => handleDelete(ext.key),
        },
        position: { x: 0, y: 0 },
      })
      rawEdges.push({
        id: `e-${ext.key}`,
        source: mainId,
        target: actId,
        style: { stroke: '#334155' },
      })
    }

    setNodes(layoutWithDagre(rawNodes, rawEdges))
    setEdges(rawEdges)
  }, [extensions, handleEdit, handleDelete, setNodes, setEdges])

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
          fitViewOptions={{ padding: 0.2 }}
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

      {selectedKey && (
        <EditPanel extKey={selectedKey} onClose={() => setSelectedKey(null)} />
      )}
    </div>
  )
}
