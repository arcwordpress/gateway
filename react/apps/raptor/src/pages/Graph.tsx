import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

type Extension = { key: string; title: string }
type SchemaProperty = { type: string; title: string; description?: string; default?: string }
type FieldGroupSchema = {
  title: string
  description?: string
  required: string[]
  properties: Record<string, SchemaProperty>
}

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit';   key: string }
  | { mode: 'delete'; key: string }
  | null

type SiteNodeType = Node<Record<string, never>, 'siteNode'>
type ExtNodeType  = Node<{ title: string; extKey: string }, 'extensionNode'>
type ActNodeType  = Node<{ actions: { label: string; onClick: () => void }[] }, 'actionsNode'>

function toKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

const fieldGroupSchemaUrl = appConfig.schemaUrl.replace(/[^/]+$/, 'field-group.json')

// ─── Custom node: Site ──────────────────────────────────────────────────────

function SiteNode(_: NodeProps<SiteNodeType>) {
  return (
    <div
      style={{
        background: '#1e40af',
        border: '1px solid #3b82f6',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#eff6ff',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        minWidth: 100,
        textAlign: 'center',
      }}
    >
      Site
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// ─── Custom node: Extension ─────────────────────────────────────────────────

function ExtensionNode({ data }: NodeProps<ExtNodeType>) {
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
        {data.extKey}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// ─── Custom node: Actions ────────────────────────────────────────────────────
// Generic node for any list of clickable actions.
// No colours — only near-black and near-white.

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

      {/* Heading */}
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

      {/* Links */}
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
  siteNode:      SiteNode      as React.ComponentType<NodeProps>,
  extensionNode: ExtensionNode as React.ComponentType<NodeProps>,
  actionsNode:   ActionsNode   as React.ComponentType<NodeProps>,
}

// ─── Dagre layout ───────────────────────────────────────────────────────────

const NODE_DIMS: Record<string, { w: number; h: number }> = {
  siteNode:      { w: 100, h: 42 },
  extensionNode: { w: 180, h: 54 },
  actionsNode:   { w: 140, h: 80 },
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

// ─── Shared panel shell ─────────────────────────────────────────────────────

// WP admin bar is always 32 px. In normal embed mode the panel must not
// cover it. In expanded mode (app fills the full viewport) it can go full height.
function usePanelGeometry() {
  const { isExpanded } = useApp()
  const constrained = appConfig.isWordPress && !isExpanded
  return {
    top:    constrained ? 32  : 0,
    height: constrained ? 'calc(100vh - 32px)' : '100vh',
  }
}

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

// ─── Shared form helpers ─────────────────────────────────────────────────────

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

// ─── Create panel ────────────────────────────────────────────────────────────

function CreatePanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<Record<string, string>>({})
  const [key, setKey] = useState('')

  const { data: schema, isLoading, isError } = useQuery<FieldGroupSchema>({
    queryKey: ['schema', 'field-group'],
    queryFn: async () => {
      const res = await fetch(fieldGroupSchemaUrl)
      if (!res.ok) throw new Error(`Failed to load schema (HTTP ${res.status})`)
      return res.json() as Promise<FieldGroupSchema>
    },
    staleTime: Infinity,
    retry: 2,
  })

  useEffect(() => {
    if (!schema) return
    setFields((prev) => {
      const seeded: Record<string, string> = {}
      for (const [name, prop] of Object.entries(schema.properties)) {
        seeded[name] = prev[name] ?? (prop.default !== undefined ? String(prop.default) : '')
      }
      return seeded
    })
  }, [schema])

  useEffect(() => {
    if (fields.title) setKey(toKey(fields.title))
    else setKey('')
  }, [fields.title])

  const setField = (name: string, val: string) =>
    setFields((prev) => ({ ...prev, [name]: val }))

  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(apiUrl('gateway/v1/extensions'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create extension')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      onClose()
    },
  })

  const required: string[] = schema?.required ?? []
  const schemaEntries = schema ? Object.entries(schema.properties) : []

  return (
    <PanelShell title="New Extension" onClose={onClose}>
      {isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Could not load schema.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const title = fields.title?.trim()
          if (!title || !key.trim()) return
          mutation.mutate({ ...fields, title, key: key.trim() })
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
                  disabled={mutation.isPending}
                  autoFocus={name === 'title'}
                  onChange={(e) => setField(name, e.target.value)}
                  className={baseInput}
                />
                {name === 'title' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Key
                      <span className="ml-1.5 text-gray-600 font-normal">auto-generated</span>
                    </label>
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800/50 text-gray-500 font-mono text-xs focus:outline-none cursor-default"
                    />
                  </div>
                )}
              </div>
            ))}

        {mutation.isError && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {(mutation.error as Error).message}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending || !fields.title?.trim() || isLoading}
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

// ─── Edit panel ──────────────────────────────────────────────────────────────

function EditPanel({ extKey, onClose }: { extKey: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<Record<string, string>>({})

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

  const { data: existing, isLoading: extLoading, isError: extError } =
    useQuery<Record<string, string>>({
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

  const isLoading = schemaLoading || extLoading
  const required: string[] = schema?.required ?? []
  const schemaEntries = schema ? Object.entries(schema.properties) : []

  return (
    <PanelShell title={existing?.title || extKey} sub={extKey} onClose={onClose}>
      {extError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
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
                  disabled={updateMutation.isPending}
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
            disabled={updateMutation.isPending || !fields.title?.trim() || isLoading}
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
    </PanelShell>
  )
}

// ─── Delete panel ────────────────────────────────────────────────────────────

function DeletePanel({ extKey, onClose }: { extKey: string; onClose: () => void }) {
  const queryClient = useQueryClient()

  const { data: existing } = useQuery<Record<string, string>>({
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

  return (
    <PanelShell title="Delete Extension" sub={extKey} onClose={onClose}>
      <p className="text-sm text-gray-300 mb-1">
        You are about to delete{' '}
        <span className="font-semibold text-gray-100">{existing?.title || extKey}</span>.
      </p>
      <p className="text-xs text-gray-500 mb-6">
        This removes the extension, its plugin files, and all associated data. This cannot be
        undone.
      </p>

      {deleteMutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(deleteMutation.error as Error).message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
        </button>
        <button
          onClick={onClose}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </PanelShell>
  )
}

// ─── Graph ───────────────────────────────────────────────────────────────────

export default function Graph() {
  const [panel, setPanel] = useState<PanelState>(null)
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

  const openCreate = useCallback(() => setPanel({ mode: 'create' }), [])
  const openEdit   = useCallback((key: string) => setPanel({ mode: 'edit',   key }), [])
  const openDelete = useCallback((key: string) => setPanel({ mode: 'delete', key }), [])
  const closePanel = useCallback(() => setPanel(null), [])

  useEffect(() => {
    const exts = extensions ?? []

    const rawNodes: Node[] = [
      // Site root node
      {
        id: 'site',
        type: 'siteNode',
        data: {},
        position: { x: 0, y: 0 },
      },
      // Site-level actions node
      {
        id: 'site-actions',
        type: 'actionsNode',
        data: {
          actions: [{ label: 'Create Extension', onClick: openCreate }],
        },
        position: { x: 0, y: 0 },
      },
    ]

    const rawEdges: Edge[] = [
      {
        id: 'e-site-actions',
        source: 'site',
        target: 'site-actions',
        style: { stroke: '#334155' },
      },
    ]

    for (const ext of exts) {
      const extId = `ext-${ext.key}`
      const actId = `act-${ext.key}`

      rawNodes.push({
        id: extId,
        type: 'extensionNode',
        data: { title: ext.title, extKey: ext.key },
        position: { x: 0, y: 0 },
      })
      rawNodes.push({
        id: actId,
        type: 'actionsNode',
        data: {
          actions: [
            { label: 'Edit',   onClick: () => openEdit(ext.key) },
            { label: 'Delete', onClick: () => openDelete(ext.key) },
          ],
        },
        position: { x: 0, y: 0 },
      })

      rawEdges.push({
        id: `e-site-${ext.key}`,
        source: 'site',
        target: extId,
        style: { stroke: '#3b82f6' },
      })
      rawEdges.push({
        id: `e-${ext.key}-act`,
        source: extId,
        target: actId,
        style: { stroke: '#334155' },
      })
    }

    setNodes(layoutWithDagre(rawNodes, rawEdges))
    setEdges(rawEdges)
  }, [extensions, openCreate, openEdit, openDelete, setNodes, setEdges])

  return (
    <>
      {/* Surface: portaled into the app container, absolute inset-0, beneath all chrome */}
      {createPortal(
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
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
        </div>,
        document.getElementById('gateway-raptor-canvas-host')!
      )}

      {panel?.mode === 'create' && <CreatePanel onClose={closePanel} />}
      {panel?.mode === 'edit'   && <EditPanel   extKey={panel.key} onClose={closePanel} />}
      {panel?.mode === 'delete' && <DeletePanel extKey={panel.key} onClose={closePanel} />}
    </>
  )
}
