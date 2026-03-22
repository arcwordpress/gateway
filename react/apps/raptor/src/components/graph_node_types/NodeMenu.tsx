import { useState, useEffect, useRef } from 'react'
import { MoreVertical } from 'lucide-react'

export interface NodeMenuItem {
  label: string
  fn: () => void
  danger?: boolean
}

interface NodeMenuProps {
  items: NodeMenuItem[]
}

export function NodeMenu({ items }: NodeMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown, { capture: true })
    return () => document.removeEventListener('mousedown', handleMouseDown, { capture: true })
  }, [open])

  if (items.length === 0) return null

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 3px',
          cursor: 'pointer',
          color: '#52525b',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          lineHeight: 1,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#52525b' }}
      >
        <MoreVertical size={13} strokeWidth={2} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 1000,
            background: '#1c1c1f',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            overflow: 'hidden',
            minWidth: 120,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {items.map(({ label, fn, danger }) => (
            <button
              key={label}
              onClick={(e) => { e.stopPropagation(); fn(); setOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '7px 12px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #27272a',
                color: danger ? '#f87171' : '#d4d4d8',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#27272a' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
