import { useContext } from 'react'
import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type RecordsContNodeData } from './types'
import { RecordsCtx } from './RecordsContext'

export function RecordsContainerNode(_: NodeProps<RecordsContNodeData>) {
  // Read live state from context — not from node data, which would freeze the
  // function reference and give stale status after the first render.
  const { status, count, onRefresh } = useContext(RecordsCtx)

  const statusLine: { text: string; color: string } = {
    idle:     { text: 'not loaded',      color: '#71717a' },
    loading:  { text: 'loading…',        color: '#a1a1aa' },
    empty:    { text: '0 records found', color: '#52525b' },
    loaded:   { text: `${count} loaded`, color: '#a1a1aa' },
    'no-route': { text: 'no API route',  color: '#71717a' },
  }[status]

  const isDisabled = status === 'loading' || status === 'no-route'

  return (
    <div
      style={{
        background: '#27272a',
        border: '1px solid #78716c',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#d4d4d8',
        fontSize: 12,
        minWidth: 150,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa', marginBottom: 4, fontWeight: 600 }}>
        Records
      </div>
      <div style={{ fontSize: 11, color: statusLine.color, marginBottom: 8 }}>
        {statusLine.text}
      </div>
      <button
        onClick={onRefresh}
        disabled={isDisabled}
        style={{
          background: 'none',
          border: `1px solid ${isDisabled ? '#3f3f46' : '#71717a'}`,
          borderRadius: 4,
          color: isDisabled ? '#3f3f46' : '#a1a1aa',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '2px 8px',
          cursor: isDisabled ? 'default' : 'pointer',
        }}
      >
        REFRESH
      </button>
    </div>
  )
}
