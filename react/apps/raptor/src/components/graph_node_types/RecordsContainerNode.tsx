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
    idle:     { text: 'not loaded',      color: '#57534e' },
    loading:  { text: 'loading…',        color: '#a8a29e' },
    empty:    { text: '0 records found', color: '#78716c' },
    loaded:   { text: `${count} loaded`, color: '#86efac' },
    'no-route': { text: 'no API route',  color: '#b45309' },
  }[status]

  const isDisabled = status === 'loading' || status === 'no-route'

  return (
    <div
      style={{
        background: '#1c1917',
        border: '1px solid #78716c',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#d6d3d1',
        fontSize: 12,
        minWidth: 150,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a8a29e', marginBottom: 4, fontWeight: 600 }}>
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
          border: `1px solid ${isDisabled ? '#3c3834' : '#57534e'}`,
          borderRadius: 4,
          color: isDisabled ? '#3c3834' : '#a8a29e',
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
