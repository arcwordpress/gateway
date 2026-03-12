import { useState } from 'react'
import CollectionsViewer from './CollectionsViewer'
import GatewayCollections from './GatewayCollections'

type Tab = 'raptor' | 'registered'

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('raptor')

  const tabCls = (tab: Tab) =>
    activeTab === tab
      ? 'px-4 py-2.5 text-xs font-semibold border-b-2 border-blue-500 text-blue-400 transition-colors'
      : 'px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-300 transition-colors'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div
        className="shrink-0 flex border-b border-gray-800"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        <button className={tabCls('raptor')} onClick={() => setActiveTab('raptor')}>
          Raptor Collections
        </button>
        <button className={tabCls('registered')} onClick={() => setActiveTab('registered')}>
          Registered Collections
        </button>
      </div>

      {/* Content — both mount but only one is visible so ReactFlow keeps its state */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 ${activeTab === 'raptor' ? '' : 'invisible pointer-events-none'}`}>
          <CollectionsViewer />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'registered' ? '' : 'invisible pointer-events-none'}`}>
          <GatewayCollections />
        </div>
      </div>
    </div>
  )
}
