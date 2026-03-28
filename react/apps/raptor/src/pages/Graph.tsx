import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { useApp } from '../context/app'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { GraphSkeleton } from '../components/graph/GraphSkeleton'
import { EXTENSIONS_GRAPH_NODE_TYPES, layoutWithDagre } from '../components/graph_node_types'

// ─── Types ─────────────────────────────────────────────────────────────────

type Extension = { key: string; title: string }
type ExtensionField = {
  name: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  default?: string
}

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit';   key: string }
  | { mode: 'delete'; key: string }
  | null

function toKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
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
  'w-full px-3 py-2 rounded-lg bg-transparent border border-zinc-800/60 text-zinc-200 ' +
  'placeholder-zinc-700 focus:outline-none focus:border-zinc-600 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-20 rounded bg-zinc-900 animate-pulse" />
      <div className="h-8 rounded-lg bg-zinc-900 animate-pulse" />
    </div>
  )
}

// ─── Shared field input renderer ─────────────────────────────────────────────

function FieldInput({
  field,
  value,
  disabled,
  autoFocus,
  onChange,
}: {
  field: ExtensionField
  value: string
  disabled: boolean
  autoFocus?: boolean
  onChange: (val: string) => void
}) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={field.placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className={baseInput + ' resize-none'}
      />
    )
  }
  return (
    <input
      type={field.type === 'url' ? 'url' : 'text'}
      value={value}
      disabled={disabled}
      autoFocus={autoFocus}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={baseInput}
    />
  )
}

// ─── Create panel ────────────────────────────────────────────────────────────

function CreatePanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [key, setKey] = useState('')

  const { data: fieldsData, isLoading, isError } = useQuery<Record<string, ExtensionField>>({
    queryKey: ['extension-fields'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/extensions/fields'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.fields as Record<string, ExtensionField>
    },
    staleTime: Infinity,
    retry: 2,
  })

  useEffect(() => {
    if (!fieldsData) return
    setValues((prev) => {
      const seeded: Record<string, string> = {}
      for (const [name, field] of Object.entries(fieldsData)) {
        seeded[name] = prev[name] ?? (field.default !== undefined ? String(field.default) : '')
      }
      return seeded
    })
  }, [fieldsData])

  useEffect(() => {
    setKey(values.title ? toKey(values.title) : '')
  }, [values.title])

  const setValue = (name: string, val: string) =>
    setValues((prev) => ({ ...prev, [name]: val }))

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

  const fieldList = fieldsData ? Object.values(fieldsData) : []

  return (
    <PanelShell title="New Extension" onClose={onClose}>
      {isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Could not load field definitions.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const title = values.title?.trim()
          if (!title || !key.trim()) return
          mutation.mutate({ ...values, title, key: key.trim() })
        }}
        className="space-y-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <FieldSkeleton key={i} />)
          : fieldList.map((field, idx) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-400">*</span>}
                  <span className="ml-1.5 text-zinc-600 font-mono font-normal">{field.name}</span>
                </label>
                <FieldInput
                  field={field}
                  value={values[field.name] ?? ''}
                  disabled={mutation.isPending}
                  autoFocus={idx === 0}
                  onChange={(val) => setValue(field.name, val)}
                />
                {field.name === 'title' && (
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
            disabled={mutation.isPending || !values.title?.trim() || isLoading}
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

type ExtensionRecord = Record<string, string>

function EditPanel({ extKey, onClose }: { extKey: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})

  // Shared field definitions – same query as CreatePanel, already preloaded at route mount
  const { data: fieldsData, isLoading: fieldsLoading } = useQuery<Record<string, ExtensionField>>({
    queryKey: ['extension-fields'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/extensions/fields'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.fields as Record<string, ExtensionField>
    },
    staleTime: Infinity,
  })

  const { data: existing, isLoading: extLoading, isError } = useQuery<ExtensionRecord>({
    queryKey: ['extensions', extKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${extKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extension as ExtensionRecord
    },
    enabled: !!extKey,
    staleTime: 30_000,
  })

  const isLoading = fieldsLoading || extLoading
  const fieldList: ExtensionField[] = fieldsData ? Object.values(fieldsData) : []

  useEffect(() => {
    if (!existing || fieldList.length === 0) return
    setValues(() => {
      const seeded: Record<string, string> = {}
      for (const field of fieldList) {
        seeded[field.name] = existing[field.name] ?? ''
      }
      return seeded
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, fieldsData])

  const setValue = (name: string, val: string) =>
    setValues((prev) => ({ ...prev, [name]: val }))

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

  return (
    <PanelShell title={existing?.title || extKey} sub={extKey} onClose={onClose}>
      {isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Could not load extension data.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!values.title?.trim()) return
          updateMutation.mutate({ ...values })
        }}
        className="space-y-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <FieldSkeleton key={i} />)
          : fieldList.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-400">*</span>}
                  <span className="ml-1.5 text-zinc-600 font-mono font-normal">{field.name}</span>
                </label>
                <FieldInput
                  field={field}
                  value={values[field.name] ?? ''}
                  disabled={updateMutation.isPending}
                  onChange={(val) => setValue(field.name, val)}
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
            disabled={updateMutation.isPending || !values.title?.trim() || isLoading}
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
    staleTime: 30_000,
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
  const queryClient = useQueryClient()
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

  // Preload field definitions as soon as the route mounts so create/edit panels
  // open instantly without waiting for the fetch.
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['extension-fields'],
      queryFn: async () => {
        const res = await fetch(apiUrl('gateway/v1/extensions/fields'), { headers: authHeaders() })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        return json.fields as Record<string, ExtensionField>
      },
      staleTime: Infinity,
    })
  }, [queryClient])

  const { data: extensions, isLoading: isExtensionsLoading } = useQuery<Extension[]>({
    queryKey: ['extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/extensions'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extensions as Extension[]
    },
  })

  // Preload each extension's full data as soon as the list is available so
  // edit/delete panels open without a loading skeleton.
  useEffect(() => {
    if (!extensions) return
    for (const ext of extensions) {
      queryClient.prefetchQuery({
        queryKey: ['extensions', ext.key],
        queryFn: async () => {
          const res = await fetch(apiUrl(`gateway/v1/extensions/${ext.key}`), {
            headers: authHeaders(),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          return json.extension as ExtensionRecord
        },
        staleTime: 30_000,
      })
    }
  }, [extensions, queryClient])

  const openCreate = useCallback(() => setPanel({ mode: 'create' }), [])
  const openEdit   = useCallback((key: string) => setPanel({ mode: 'edit',   key }), [])
  const openDelete = useCallback((key: string) => setPanel({ mode: 'delete', key }), [])
  const closePanel = useCallback(() => setPanel(null), [])
  const extensionsSignature = (extensions ?? []).map((ext) => ext.key).join('|')

  useEffect(() => {
    const exts = extensions ?? []

    const rawNodes: Node[] = [
      // Site root node — fixed in place
      {
        id: 'site',
        type: 'siteNode',
        data: { onCreateExtension: openCreate },
        position: { x: 0, y: 0 },
        draggable: false,
      },
    ]

    const rawEdges: Edge[] = []

    for (const ext of exts) {
      const extId = `ext-${ext.key}`

      rawNodes.push({
        id: extId,
        type: 'extensionNode',
        data: {
          title: ext.title,
          extKey: ext.key,
          onEdit:   () => openEdit(ext.key),
          onDelete: () => openDelete(ext.key),
        },
        position: { x: 0, y: 0 },
      })

      rawEdges.push({
        id:     `e-site-${ext.key}`,
        source: 'site',
        target: extId,
        type:   'smoothstep',
        style:  { stroke: '#52525b' },
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
      rfInstance.fitView({ padding: 0.25, duration: 0, maxZoom: 1 })
    })

    return () => cancelAnimationFrame(frame)
  }, [rfInstance, extensionsSignature, nodes.length, edges.length])

  return (
    <>
      {/* Surface: portaled into the app container, absolute inset-0, beneath all chrome */}
      {canvasHost && createPortal(
        <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
        {isExtensionsLoading
          ? <GraphSkeleton />
          : <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={setRfInstance}
              nodeTypes={EXTENSIONS_GRAPH_NODE_TYPES}
              fitView
              fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
              <Controls position="top-right" style={{ marginTop: 8, marginRight: 16 }} />
              <SharedMiniMap />
            </ReactFlow>
        }
        </div>,
        canvasHost
      )}

      {panel?.mode === 'create' && <CreatePanel onClose={closePanel} />}
      {panel?.mode === 'edit'   && <EditPanel   extKey={panel.key} onClose={closePanel} />}
      {panel?.mode === 'delete' && <DeletePanel extKey={panel.key} onClose={closePanel} />}
    </>
  )
}
