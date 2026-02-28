import type { ReactNode } from 'react'

// ─── Footer.Credit ──────────────────────────────────────────────────────────

function Credit({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] text-gray-600 select-none font-mono">
      {children}
    </span>
  )
}

// ─── Footer (root) ──────────────────────────────────────────────────────────

interface FooterProps {
  children: ReactNode
  className?: string
}

function FooterRoot({ children, className }: FooterProps) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      {children}
    </div>
  )
}

// ─── Namespace ──────────────────────────────────────────────────────────────

const Footer = Object.assign(FooterRoot, { Credit })

export default Footer
