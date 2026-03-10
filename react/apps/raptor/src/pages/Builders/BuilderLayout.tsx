import { ReactNode } from 'react'

interface BuilderLayoutProps {
  children: ReactNode
}

/**
 * Container for builder pages (Fields/Views/Forms).
 * Provides position-relative wrapper for absolute-positioned floating panels over edge-to-edge graph.
 */
export function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {children}
    </div>
  )
}
