import { useEffect } from 'react'
import {
  useNodesState, useEdgesState,
  type Node, type Edge, type NodeTypes,
} from '@xyflow/react'
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { PACKAGES_GRAPH_NODE_TYPES } from '../../components/graph_node_types'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'

export type PackageRecord = {
  package_key: string
  extension_id: number | null
  label: string
  icon: string
  has_collections: boolean
  collection_keys: string[]
}

export type ExtensionRecord = {
  id: number
  extension_key: string
  title: string
}

// ─── Empty-hint node ──────────────────────────────────────────────────────

function EmptyHintNode() {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px dashed #3f3f46',
        borderRadius: 8,
        padding: '10px 16px',
        minWidth: 200,
        color: '#52525b',
        fontSize: 11,
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      No packages — use <strong style={{ color: '#71717a' }}>+ New Package</strong> to get started
    </div>
  )
}

const NODE_TYPES: NodeTypes = {
  ...PACKAGES_GRAPH_NODE_TYPES,
  emptyHintNode: EmptyHintNode,
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

  const extMap = new Map(extensions.map((e) => [e.id, e]))

  // Always seed a group for every visible extension so the graph shows
  // extension nodes even when they have no packages yet.
  const groups = new Map<number | null, PackageRecord[]>()
  for (const ext of extensions) {
    groups.set(ext.id, [])
  }
  for (const pkg of packages) {
    const k = pkg.extension_id ?? null
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(pkg)
  }

  let yOffset = 0

  groups.forEach((pkgs, extId) => {
    const ext = extId !== null ? extMap.get(extId) : null
    const groupNodeId = extId !== null ? `ext-${extId}` : 'ext-unassigned'

    computedNodes.push({
      id: groupNodeId,
      type: 'extensionNode',
      data: { title: ext?.title ?? '', extKey: ext?.extension_key ?? '', isActive: false },
      position: { x: 0, y: yOffset },
    })

    if (pkgs.length === 0) {
      const emptyId = `empty-${groupNodeId}`
      computedNodes.push({
        id: emptyId,
        type: 'emptyHintNode',
        data: {},
        position: { x: 260, y: yOffset + 10 },
      })
      computedEdges.push({
        id: `edge-${groupNodeId}-${emptyId}`,
        source: groupNodeId,
        target: emptyId,
        style: { stroke: '#3f3f46', strokeDasharray: '4 4' },
      })
      yOffset += 100 + 40
    } else {
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
    }
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
        nodeTypes={NODE_TYPES}
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
