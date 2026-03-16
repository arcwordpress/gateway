import { useState, useCallback, useEffect, useRef } from 'react'
import { PlusCircle } from 'lucide-react'
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
  type ReactFlowInstance,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { appConfig } from '../config'
import { apiUrl, authHeaders } from '../lib/api'
import { useApp } from '../context/app'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'

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

type SiteNodeType = Node<{ onCreateExtension: () => void }, 'siteNode'>
type ExtNodeType  = Node<{ title: string; extKey: string }, 'extensionNode'>
type ActNodeType  = Node<{ actions: { label: string; onClick: () => void }[] }, 'actionsNode'>

function toKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

const fieldGroupSchemaUrl = appConfig.schemaUrl.replace(/[^/]+$/, 'field-group.json')

// ─── Custom node: Site ──────────────────────────────────────────────────────

function SiteNode({ data }: NodeProps<SiteNodeType>) {
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 pt-3 pb-3 flex flex-col items-center gap-3 min-w-[170px]">
      <span className="text-neutral-300 text-xs font-semibold tracking-[0.12em] uppercase select-none">
        Site
      </span>
      <button
        onClick={data.onCreateExtension}
        className="flex items-center gap-2 w-full justify-center px-3 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 text-sm font-medium transition-colors cursor-pointer"
      >
        <PlusCircle size={15} strokeWidth={2} />
        Create Extension
      </button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// ─── Custom node: Extension ─────────────────────────────────────────────────

function ExtensionNode({ data }: NodeProps<ExtNodeType>) {
  return (
    <div
      style={{
        background: '#27272a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 14px',
        width: 180,
        color: '#e4e4e7',
        fontSize: 13,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 500 }}>{data.title}</div>
      <div style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', marginTop: 2 }}>
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
        background: '#18181b',
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
          color: '#e4e4e7',
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
  siteNode:      SiteNode      as React.ComponentType<NodeProps>,
  extensionNode: ExtensionNode as React.ComponentType<NodeProps>,
  actionsNode:   ActionsNode   as React.ComponentType<NodeProps>,
}

// ─── Dagre layout ───────────────────────────────────────────────────────────

const NODE_DIMS: Record<string, { w: number; h: number }> = {
  siteNode:      { w: 170, h: 90 },
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
  const { shellTopOffset, shellHeightCss } = useApp()
  return {
    top: shellTopOffset,
    height: shellHeightCss,
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
        background: 'var(--app-bg)',
        borderLeft: '1px solid #3f3f46',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
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

// ─── Shared form helpers ─────────────────────────────────────────────────────

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-20 rounded bg-zinc-900 animate-pulse" />
      <div className="h-8 rounded-lg bg-zinc-900 animate-pulse" />
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
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {prop.title}
                  {required.includes(name) && <span className="ml-1 text-red-400">*</span>}
                  <span className="ml-1.5 text-zinc-600 font-mono font-normal">{name}</span>
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
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Key
                      <span className="ml-1.5 text-zinc-600 font-normal">auto-generated</span>
                    </label>
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 font-mono text-xs focus:outline-none cursor-default"
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
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {prop.title}
                  {required.includes(name) && <span className="ml-1 text-red-400">*</span>}
                  <span className="ml-1.5 text-zinc-600 font-mono font-normal">{name}</span>
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
            className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
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
      <p className="text-sm text-zinc-300 mb-1">
        You are about to delete{' '}
        <span className="font-semibold text-zinc-100">{existing?.title || extKey}</span>.
      </p>
      <p className="text-xs text-zinc-500 mb-6">
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
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-sm font-medium transition-colors"
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
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null)
  const lastFitSignatureRef = useRef('')
  const [canvasHost, setCanvasHost] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const outletHost = document.getElementById('gateway-raptor-outlet')
    setCanvasHost(outletHost ?? document.getElementById('gateway-raptor-canvas-host'))
  }, [])

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
  const extensionsSignature = (extensions ?? []).map((ext) => ext.key).join('|')

  useEffect(() => {
    const exts = extensions ?? []

    const rawNodes: Node[] = [
      // Site root node
      {
        id: 'site',
        type: 'siteNode',
        data: { onCreateExtension: openCreate },
        position: { x: 0, y: 0 },
      },
    ]

    const rawEdges: Edge[] = []

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
        style: { stroke: '#52525b' },
      })
      rawEdges.push({
        id: `e-${ext.key}-act`,
        source: extId,
        target: actId,
        style: { stroke: '#3f3f46' },
      })
    }

    setNodes(layoutWithDagre(rawNodes, rawEdges))
    setEdges(rawEdges)
  }, [extensions, openCreate, openEdit, openDelete, setNodes, setEdges])

  useEffect(() => {
    if (!rfInstance || nodes.length === 0) return

    const fitSignature = `${extensionsSignature}:${nodes.length}:${edges.length}`
    if (lastFitSignatureRef.current === fitSignature) return
    lastFitSignatureRef.current = fitSignature

    // Run after the new node layout is committed so first render matches Fit View.
    const frame = requestAnimationFrame(() => {
      rfInstance.fitView({ padding: 0.25, duration: 0 })
    })

    return () => cancelAnimationFrame(frame)
  }, [rfInstance, extensionsSignature, nodes.length, edges.length])

  return (
    <>
      {/* Surface: portaled into the app container, absolute inset-0, beneath all chrome */}
      {canvasHost && createPortal(
        <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
          <Controls position="top-right" style={{ marginTop: 8, marginRight: 16 }} />
          <SharedMiniMap />
        </ReactFlow>
        </div>,
        canvasHost
      )}

      {panel?.mode === 'create' && <CreatePanel onClose={closePanel} />}
      {panel?.mode === 'edit'   && <EditPanel   extKey={panel.key} onClose={closePanel} />}
      {panel?.mode === 'delete' && <DeletePanel extKey={panel.key} onClose={closePanel} />}
    </>
  )
}
