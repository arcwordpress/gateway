import { useEffect, useState, useCallback } from 'react'
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import { FIELD_GRAPH_NODE_TYPES } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import { useCollection, useForms } from './FormsPageContext'
import { useUserLayout } from '../../lib/useUserLayout'
import '@xyflow/react/dist/style.css'

export function Graph() {
  const { collection } = useCollection()
  const { forms } = useForms()
  const collKey = collection?.collection_key ?? ''
  const routeKey = collKey ? `collections-${collKey}-forms` : 'collections-unknown-forms'
  const { savedNodes, saveLayout, resetLayout } = useUserLayout(routeKey)
  const [selectedForm, setSelectedForm] = useState<{ title: string; formKey: string } | null>(null)

  const baseNodes: Node[] = [
    {
      id: 'collection',
      type: 'collectionRootNode',
      data: {
        title: collection?.title ?? collection?.collection_key ?? 'Collection',
        collKey: collection?.collection_key ?? '',
      },
      position: { x: 200, y: 0 },
    },
    {
      id: 'form-list-label',
      type: 'formListLabel',
      data: {},
      position: { x: 200, y: 140 },
    },
  ]

  const formNodes: Node[] = forms.map((form, idx) => ({
    id: `form-${form.form_key}`,
    type: 'formNode',
    data: { title: form.title || form.form_key, formKey: form.form_key },
    position: { x: 200 + idx * 220, y: 260 },
  }))

  const computedEdges: Edge[] = [
    { id: 'e-collection-formlist', source: 'collection', target: 'form-list-label' },
    ...forms.map((form) => ({
      id: `e-formlist-${form.form_key}`,
      source: 'form-list-label',
      target: `form-${form.form_key}`,
    })),
  ]

  // Apply saved positions on top of default computed positions when available
  const computedNodes: Node[] = [...baseNodes, ...formNodes].map((n) => {
    const saved = savedNodes?.find((s) => s.id === n.id)
    return saved ? { ...n, position: { x: saved.x, y: saved.y } } : n
  })

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => {
    setGraphNodes(
      [...baseNodes, ...formNodes].map((n) => {
        const saved = savedNodes?.find((s) => s.id === n.id)
        return saved ? { ...n, position: { x: saved.x, y: saved.y } } : n
      })
    )
  }, [collection, forms, savedNodes])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setGraphEdges(computedEdges) }, [forms])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, _node: Node, allNodes: Node[]) => {
      saveLayout(allNodes)
    },
    [saveLayout],
  )

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'formNode') {
      const data = node.data as { title: string; formKey: string }
      setSelectedForm({ title: data.title, formKey: data.formKey })
    }
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedForm(null)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={graphNodes}
        edges={graphEdges}
        nodeTypes={FIELD_GRAPH_NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
        <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
        <SharedMiniMap />
        {savedNodes !== null && (
          <Panel position="bottom-left">
            <button
              onClick={resetLayout}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                borderRadius: 6,
                border: '1px solid #3f3f46',
                background: 'transparent',
                color: '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              Reset Layout
            </button>
          </Panel>
        )}
      </ReactFlow>

      {selectedForm && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 16,
            zIndex: 10,
            background: 'var(--node-bg, #18181b)',
            border: '1px solid #27272a',
            borderRadius: 8,
            padding: '12px 16px',
            minWidth: 200,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => setSelectedForm(null)}
            style={{
              position: 'absolute',
              top: 8,
              right: 10,
              color: '#71717a',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
          <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Form</div>
          <div style={{ color: '#e4e4e7', fontWeight: 600, marginBottom: 4 }}>{selectedForm.title}</div>
          <div style={{ fontSize: 10, color: '#71717a', fontFamily: 'monospace' }}>{selectedForm.formKey}</div>
        </div>
      )}
    </div>
  )
}
