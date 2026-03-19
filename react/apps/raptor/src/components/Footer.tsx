import type { ReactNode, CSSProperties } from 'react'

// ─── Footer.Credit ──────────────────────────────────────────────────────────

function Credit({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] text-zinc-600 select-none font-mono">
      {children}
    </span>
  )
}

// ─── Footer (root) ──────────────────────────────────────────────────────────

interface FooterProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

function FooterRoot({ children, className, style }: FooterProps) {
  return (
    <div className={`flex items-center ${className ?? ''}`} style={style}>
      {children}
    </div>
  )
}

// ─── Namespace ──────────────────────────────────────────────────────────────

const Footer = Object.assign(FooterRoot, { Credit })

export default Footer
