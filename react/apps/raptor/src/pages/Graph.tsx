import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
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
import '@xyflow/react/dist/style.css'
import { useWorkspace } from '../context/workspace'
import PanelShell from '../components/ui/PanelShell'
import CreateExtensionPanelContent from '../components/extensions/CreateExtensionPanelContent'
import EditExtensionPanelContent from '../components/extensions/EditExtensionPanelContent'
import DeleteExtensionPanelContent from '../components/extensions/DeleteExtensionPanel'
import { SharedMiniMap } from '../components/graph/SharedMiniMap'
import { GraphSkeleton } from '../components/graph/GraphSkeleton'
import { EXTENSIONS_GRAPH_NODE_TYPES, layoutWithDagre } from '../components/graph_node_types'

// ─── Types ─────────────────────────────────────────────────────────────────

type Extension = { key: string; title: string }

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit';   key: string }
  | { mode: 'delete'; key: string }
  | null

// ─d─────────────────────────────────────────────────────────────────

export default function Graph() {
  const { extensions: workspaceExtensions, isExtensionsLoading } = useWorkspace()
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

  const extensions = useMemo<Extension[]>(() => {
    return workspaceExtensions.map((ext) => ({
      key: ext.extension_key,
      title: ext.title,
    }))
  }, [workspaceExtensions])

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

      {panel?.mode === 'create' && (
        <PanelShell title="New Extension" onClose={closePanel} width={320}>
          <CreateExtensionPanelContent onClose={closePanel} />
        </PanelShell>
      )}
      {panel?.mode === 'edit'   && (
        <PanelShell title="Edit Extension" sub={panel.key} onClose={closePanel} width={320}>
          <EditExtensionPanelContent extKey={panel.key} onClose={closePanel} />
        </PanelShell>
      )}
      {panel?.mode === 'delete' && (
        <PanelShell title="Delete Extension" sub={panel.key} onClose={closePanel} width={320}>
          <DeleteExtensionPanelContent extKey={panel.key} onClose={closePanel} />
        </PanelShell>
      )}
    </>
  )
}
