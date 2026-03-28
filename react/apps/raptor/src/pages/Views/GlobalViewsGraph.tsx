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
 * Global views graph — collections data passed in from ViewsTopLevel
 * (already fetched via the single ?with_nested=true bulk request).
 */
export function GlobalViewsGraph({ collections }: { collections: Collection[] }) {
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []
  let yOffset = 0

  collections.forEach((collection) => {
    const views = collection.view_list?.views ?? []
    if (views.length === 0) return

    const collectionNodeId = `collection-${collection.id}`
    computedNodes.push({
      id: collectionNodeId,
      type: 'collectionRootNode',
      data: { title: collection.title, collKey: collection.collection_key },
      position: { x: 0, y: yOffset },
    })
    yOffset += 80

    views.forEach((view: { view_key: string; title?: string }, idx: number) => {
      const nodeId = `view-${collection.id}-${view.view_key}`
      computedNodes.push({
        id: nodeId,
        type: 'viewNode',
        data: {
          title: view.title || view.view_key,
          viewKey: view.view_key,
          isExpanded: false,
          onToggle: () => {},
        },
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
