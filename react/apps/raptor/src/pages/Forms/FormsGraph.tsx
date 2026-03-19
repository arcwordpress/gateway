import { useEffect } from 'react'
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import { FIELD_GRAPH_NODE_TYPES } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import { useCollection, useForms } from './FormsPageContext'
import '@xyflow/react/dist/style.css'

export function Graph() {
  const { collection } = useCollection()
  const { forms } = useForms()

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

  const computedNodes: Node[] = [...baseNodes, ...formNodes]

  const [graphNodes, setGraphNodes, onNodesChange] = useNodesState(computedNodes)
  const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState(computedEdges)

  useEffect(() => { setGraphNodes(computedNodes) }, [collection, forms])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setGraphEdges(computedEdges) }, [forms])               // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={graphNodes}
        edges={graphEdges}
        nodeTypes={FIELD_GRAPH_NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
        <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
        <SharedMiniMap />
      </ReactFlow>
    </div>
  )
}
