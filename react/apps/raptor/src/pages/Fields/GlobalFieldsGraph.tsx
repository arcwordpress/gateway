import { useEffect } from 'react'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { RecordsStatus, RecordsCtxValue, RecordsCtx } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import type { Collection } from '../../lib/object_types'

/**
 * Global fields graph showing all fields from all collections.
 * Collections data is passed in from the parent (FieldsTopLevel) which
 * already fetches it via the efficient ?with_nested=true bulk endpoint.
 */
export function GlobalFieldsGraph({ collections }: { collections: Collection[] }) {
  // Build nodes from all collections' fields
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []
  let yOffset = 0

  collections.forEach((collection) => {
    const fields = collection.field_list?.fields ?? []
    if (fields.length === 0) return

    const collectionNodeId = `collection-${collection.id}`
    computedNodes.push({
      id: collectionNodeId,
      data: {
        label: collection.title,
        type: 'collection',
      },
      position: { x: 0, y: yOffset },
      type: 'default',
      style: {
        background: 'var(--node-bg)',
        border: '1px solid #4b5563',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#e4e4e7',
        width: 'auto',
        minWidth: '200px',
      },
    })
    yOffset += 80

    fields.forEach((field, idx) => {
      const nodeId = `field-${collection.id}-${field.name}`
      computedNodes.push({
        id: nodeId,
        data: {
          label: field.label || field.name,
          type: field.type,
        },
        position: { x: idx * 240, y: yOffset },
        type: 'default',
        style: {
          background: 'var(--node-bg)',
          border: '1px solid #374151',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#d4d4d8',
          width: 'auto',
          minWidth: '150px',
        },
      })

      computedEdges.push({
        id: `edge-${collectionNodeId}-${nodeId}`,
        source: collectionNodeId,
        target: nodeId,
        animated: false,
        style: { stroke: '#3f3f46' },
      })
    })
    yOffset += 120
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
          <SharedMiniMap />
        </ReactFlow>
      </div>
    </RecordsCtx.Provider>
  )
}
