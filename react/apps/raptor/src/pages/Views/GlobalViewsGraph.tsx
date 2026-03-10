import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { RecordsStatus, RecordsCtxValue, RecordsCtx } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import type { Collection } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'

/**
 * Global views graph showing all views from all collections
 */
export function GlobalViewsGraph() {
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const [graphHeightPx, setGraphHeightPx] = useState(480)

  // Load all collections
  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['raptor-collections-global-graph-views'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json() as { collections?: Collection[] }
      return json.collections ?? []
    },
  })

  // Build nodes from all collections' views - COMPUTED DIRECTLY
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []
  let yOffset = 0

  collections.forEach((collection) => {
    const views = collection.view_list?.views ?? []
    if (views.length === 0) return

    // Collection group header
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
        background: '#1f2937',
        border: '1px solid #4b5563',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#e5e7eb',
        width: 'auto',
        minWidth: '200px',
      },
    })
    yOffset += 80

    // Views in this collection
    views.forEach((view: any, idx: number) => {
      const nodeId = `view-${collection.id}-${view.view_key}`
      computedNodes.push({
        id: nodeId,
        data: {
          label: view.view_key,
          type: 'view',
        },
        position: { x: idx * 240, y: yOffset },
        type: 'default',
        style: {
          background: '#111827',
          border: '1px solid #374151',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#d1d5db',
          width: 'auto',
          minWidth: '150px',
        },
      })

      computedEdges.push({
        id: `edge-${collectionNodeId}-${nodeId}`,
        source: collectionNodeId,
        target: nodeId,
        animated: false,
        style: { stroke: '#4b5563' },
      })
    })
    yOffset += 120
  })

  console.log('[GlobalViewsGraph] Computed nodes:', computedNodes.length, 'edges:', computedEdges.length)

  // Initialize with computed nodes (not empty!)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(computedEdges)

  // Sync when collections change
  useEffect(() => {
    console.log('[GlobalViewsGraph] useEffect called, syncing computed nodes')
    setNodes(computedNodes)
    setEdges(computedEdges)
  }, [collections, setNodes, setEdges])

  // Sync graph height with container
  useEffect(() => {
    const updateHeight = () => {
      if (graphContainerRef.current) {
        const rect = graphContainerRef.current.getBoundingClientRect()
        const available = window.innerHeight - rect.top
        setGraphHeightPx(Math.max(available, 400))
      }
    }

    updateHeight()
    const resizeObserver = new ResizeObserver(updateHeight)
    if (graphContainerRef.current) {
      resizeObserver.observe(graphContainerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  const recordsCtx: RecordsCtxValue = {
    status: 'loaded' as RecordsStatus,
    recordList: [],
  }

  return (
    <div
      ref={graphContainerRef}
      className="w-full"
      style={{ height: `${graphHeightPx}px` }}
    >
      <RecordsCtx.Provider value={recordsCtx}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
          <SharedMiniMap />
        </ReactFlow>
      </RecordsCtx.Provider>
    </div>
  )
}
