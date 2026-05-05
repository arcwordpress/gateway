import { useEffect } from 'react'
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
  has_collections: boolean
  collection_keys: string[]
}

export type ExtensionRecord = {
  extension_key: string
  title: string
}

export function GlobalPackagesGraph({
  packages,
  extensions,
  onPackageSelect,
}: {
  packages: PackageRecord[]
  extensions: ExtensionRecord[]
  onPackageSelect: (key: string) => void
}) {
  const computedNodes: Node[] = []
  const computedEdges: Edge[] = []

  const extMap = new Map(extensions.map((e) => [e.extension_key, e]))

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

    computedNodes.push({
      id: groupNodeId,
      type: 'extensionNode',
      data: { title: ext?.title ?? '', extKey: extKey ?? '', isActive: false },
      position: { x: 0, y: yOffset },
    })

    pkgs.forEach((pkg, idx) => {
      const nodeId = `pkg-${pkg.package_key}`
      computedNodes.push({
        id: nodeId,
        type: 'packageNode',
        data: {
          label: pkg.label,
          packageKey: pkg.package_key,
          icon: pkg.icon ?? 'dashicons-admin-generic',
          onSelect: onPackageSelect,
        },
        position: { x: 260, y: yOffset + idx * 100 },
      })
      computedEdges.push({
        id: `edge-${groupNodeId}-${nodeId}`,
        source: groupNodeId,
        target: nodeId,
        style: { stroke: '#3f3f46' },
      })
    })

    yOffset += Math.max(pkgs.length, 1) * 100 + 40
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
