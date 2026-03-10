import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

// ─── Gateway icon (same SVG used for the WP admin menu entry) ──────────────

function GatewayIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M0 14.6875V17.7196L14.5402 23.3418L29.0803 17.7196V14.6875L14.5402 20.3019L0 14.6875Z"
      />
      <path
        fill="currentColor"
        d="M14.5402 14.261L0 8.64655V11.6631L14.5402 17.2853L29.0803 11.6631V8.63104L14.5402 14.261Z"
      />
      <path
        fill="currentColor"
        d="M29.0803 5.61444L14.5402 0L0 5.61444L14.5402 11.2366L29.0803 5.61444Z"
      />
    </svg>
  )
}

// ─── Header.Logo ───────────────────────────────────────────────────────────

interface LogoProps {
  /** Hide the "GATEWAY" wordmark — useful when the sidebar is collapsed */
  wordmark?: boolean
  className?: string
}

function Logo({ wordmark = true, className }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className ?? ''} hover:opacity-80 transition-opacity`}>
      <GatewayIcon className="w-5 h-4 text-gray-100 shrink-0" />
      {wordmark && (
        <span className="font-semibold text-gray-100 text-sm tracking-widest select-none uppercase">
          Gateway
        </span>
      )}
    </Link>
  )
}

// ─── Header (root) ─────────────────────────────────────────────────────────

interface HeaderProps {
  children: ReactNode
  className?: string
}

function HeaderRoot({ children, className }: HeaderProps) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      {children}
    </div>
  )
}

// ─── Namespace ─────────────────────────────────────────────────────────────

const Header = Object.assign(HeaderRoot, { Logo })

export default Header
