import { PlusCircle } from 'lucide-react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type SiteNodeType = Node<{ onCreateExtension: () => void }, 'siteNode'>

export function SiteNode({ data }: NodeProps<SiteNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #3f3f46',
        borderRadius: 12,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        minWidth: 170,
      }}
    >
      <NodeTypeHeader label="Site" />
      <button
        onClick={data.onCreateExtension}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          justifyContent: 'center',
          padding: '8px 12px',
          borderRadius: 8,
          background: '#3f3f46',
          border: 'none',
          color: '#e4e4e7',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#52525b' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46' }}
      >
        <PlusCircle size={15} strokeWidth={2} />
        Create Extension
      </button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
