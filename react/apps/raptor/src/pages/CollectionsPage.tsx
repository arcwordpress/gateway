import { useState } from 'react'
import CollectionsViewer from './CollectionsViewer'
import GatewayCollections from './GatewayCollections'

type Tab = 'editable' | 'registered'

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('editable')

  const tabCls = (tab: Tab) =>
    activeTab === tab
      ? 'px-4 py-2.5 text-xs font-semibold border-b-2 border-zinc-400 text-zinc-200 transition-colors'
      : 'px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 transition-colors'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div
        className="shrink-0 flex border-b border-zinc-800"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        <button className={tabCls('editable')} onClick={() => setActiveTab('editable')}>
          Editable Collections
        </button>
        <button className={tabCls('registered')} onClick={() => setActiveTab('registered')}>
          Registered Collections
        </button>
      </div>

      {/* Content — CollectionsViewer stays mounted so ReactFlow preserves pan/zoom/expand state.
          When the registered tab is active we render GatewayCollections on top with a solid
          background, fully covering the graph. Using visibility:hidden is not sufficient because
          ReactFlow node containers explicitly set visibility:visible on their children, causing
          nodes to bleed through at full opacity while the background fades. */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0">
          <CollectionsViewer />
        </div>
        {activeTab === 'registered' && (
          <div className="absolute inset-0 z-10 overflow-auto" style={{ backgroundColor: 'var(--app-bg)' }}>
            <GatewayCollections />
          </div>
        )}
      </div>
    </div>
  )
}
