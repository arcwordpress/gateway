import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { RecordsStatus, RecordsCtxValue, RecordsCtx } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import { GraphSkeleton } from '../../components/graph/GraphSkeleton'
import type { Collection } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'

/**
 * Global fields graph showing all fields from all collections
 */
export function GlobalFieldsGraph() {
  // Load all collections
  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ['raptor-collections-global-graph'],
    queryFn: async () => {
      const listRoute = 'gateway/v1/raptor/collection'
      const listRes = await fetch(apiUrl(listRoute), { headers: authHeaders() })
      if (!listRes.ok) return []

      const listJson = await listRes.json() as {
        collections?: Array<{ collection_key: string }>
      }
      const items = listJson.collections ?? []
      if (items.length === 0) return []

      const details = await Promise.all(
        items.map(async (item) => {
          const detailRoute = `gateway/v1/raptor/collection/${item.collection_key}`
          const detailRes = await fetch(apiUrl(detailRoute), { headers: authHeaders() })
          if (!detailRes.ok) return null
          const detailJson = await detailRes.json() as { collection?: Collection }
          return detailJson.collection ?? null
        }),
      )

      return details.filter((c): c is Collection => c !== null)
    },
  })

  // Build nodes from all collections' fields - COMPUTED DIRECTLY
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []
  let yOffset = 0

  collections.forEach((collection) => {
    const fields = collection.field_list?.fields ?? []
    if (fields.length === 0) return

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
        background: '#27272a',
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

    // Fields in this collection
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
          background: '#18181b',
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

  console.log('[GlobalFieldsGraph] Computed nodes:', computedNodes.length, 'edges:', computedEdges.length)

  // Initialize with computed nodes (not empty!)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(computedEdges)

  // Sync when collections change
  useEffect(() => {
    console.log('[GlobalFieldsGraph] useEffect called, syncing computed nodes')
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
        {isLoading ? <GraphSkeleton /> : (
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
        )}
      </div>
    </RecordsCtx.Provider>
  )
}
