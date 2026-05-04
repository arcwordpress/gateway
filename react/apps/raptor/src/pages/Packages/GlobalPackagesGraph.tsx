import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useNodesState, useEdgesState,
  type Node, type Edge,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { PACKAGES_GRAPH_NODE_TYPES } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'

export type PackageRecord = {
  package_key: string
  extension_key: string | null
  label: string
  icon: string
}

export type ExtensionRecord = {
  extension_key: string
  title: string
}

export function GlobalPackagesGraph({
  packages,
  extensions,
}: {
  packages: PackageRecord[]
  extensions: ExtensionRecord[]
}) {
  const navigate = useNavigate()
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []

  const extMap = new Map(extensions.map((e) => [e.extension_key, e]))

  // Group packages: keyed by extension_key (null → 'unassigned')
  const groups = new Map<string | null, PackageRecord[]>()
  for (const pkg of packages) {
    const k = pkg.extension_key ?? null
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(pkg)
  }

  let yOffset = 0

  groups.forEach((pkgs, extKey) => {
    const ext = extKey ? extMap.get(extKey) : null
    const groupNodeId = extKey ? `ext-${extKey}` : 'ext-unassigned'

    // Extension (or "Unassigned") root node
    computedNodes.push({
      id: groupNodeId,
      type: 'collectionRootNode',
      data: {
        title: ext?.title ?? 'Unassigned',
        collKey: extKey ?? '',
      },
      position: { x: 0, y: yOffset },
    })
    yOffset += 80

    pkgs.forEach((pkg, idx) => {
      const nodeId = `pkg-${pkg.package_key}`
      computedNodes.push({
        id: nodeId,
        type: 'packageNode',
        data: {
          label: pkg.label,
          packageKey: pkg.package_key,
          icon: pkg.icon ?? 'dashicons-admin-generic',
          onEdit: (key: string) => {
            void navigate({ to: `/packages/${key}/edit` as never })
          },
        },
        position: { x: idx * 210, y: yOffset },
      })
      computedEdges.push({
        id: `edge-${groupNodeId}-${nodeId}`,
        source: groupNodeId,
        target: nodeId,
        style: { stroke: '#3f3f46' },
      })
    })

    yOffset += 160
  })

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(computedEdges)

  useEffect(() => {
    setNodes(computedNodes)
    setEdges(computedEdges)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, extensions])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={PACKAGES_GRAPH_NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
        <SharedMiniMap />
      </ReactFlow>
    </div>
  )
}
