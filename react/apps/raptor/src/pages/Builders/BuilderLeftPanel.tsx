import { ReactNode } from 'react'

interface BuilderLeftPanelProps {
  children: ReactNode
}

/**
 * Floating left panel for builder pages.
 * Contains List/Editor/Files sections and floats above graph with gap from edges.
 */
export function BuilderLeftPanel({ children }: BuilderLeftPanelProps) {
  return (
    <div
      className="absolute left-4 top-20 bottom-4 z-10 w-96 flex flex-col rounded border border-zinc-700 bg-dark backdrop-blur-sm overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
      </div>
    </div>
  )
}
