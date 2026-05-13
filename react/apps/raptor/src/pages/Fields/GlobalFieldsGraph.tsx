import { useEffect } from 'react'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { RecordsStatus, RecordsCtxValue, RecordsCtx, GLOBAL_OVERVIEW_NODE_TYPES } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import type { Collection } from '../../lib/object_types'

/**
 * Global fields graph — collections data passed in from FieldsTopLevel
 * (already fetched via the single ?with_nested=true bulk request).
 */
export function GlobalFieldsGraph({ collections }: { collections: Collection[] }) {
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []
  let yOffset = 0

  collections.forEach((collection) => {
    const fields = collection?.field_list?.fields ?? []
    if (fields.length === 0) return

    const collectionNodeId = `collection-${collection.id}`
    computedNodes.push({
      id: collectionNodeId,
      type: 'collectionRootNode',
      data: { title: collection.title, collKey: collection.collection_key },
      position: { x: 0, y: yOffset },
    })
    yOffset += 80

    fields.forEach((field, idx) => {
      const nodeId = `field-${collection.id}-${field.name}`
      computedNodes.push({
        id: nodeId,
        type: 'fieldNode',
        data: { label: field.label || field.name, fieldType: field.type },
        position: { x: idx * 200, y: yOffset },
      })
      computedEdges.push({
        id: `edge-${collectionNodeId}-${nodeId}`,
        source: collectionNodeId,
        target: nodeId,
        style: { stroke: '#3f3f46' },
      })
    })
    yOffset += 140
  })

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(computedEdges)

  useEffect(() => {
    setNodes(computedNodes)
    setEdges(computedEdges)
  }, [collections, setNodes, setEdges])

  const recordsCtx: RecordsCtxValue = {
    status: 'loaded' as RecordsStatus,
    count: 0,
    onRefresh: () => {},
  }

  return (
    <RecordsCtx.Provider value={recordsCtx}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={GLOBAL_OVERVIEW_NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
          <SharedMiniMap />
        </ReactFlow>
      </div>
    </RecordsCtx.Provider>
  )
}
