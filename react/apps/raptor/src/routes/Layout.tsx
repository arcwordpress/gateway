import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { appConfig } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/ui/Sidebar'
import { AppContext } from '../context/app'
import { WorkspaceContext, WorkspaceCollection } from '../context/workspace'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Root layout ───────────────────────────────────────────────────────────
//
//  ┌──────┬──────────────────────────────────┐
//  │      │  HEADER            [EXPAND/EXIT]  │
//  │ LEFT ├──────────────────────────────────┤
//  │      │  MAIN                            │
//  │      ├──────────────────────────────────┤
//  │      │  FOOTER            credit →      │
//  └──────┴──────────────────────────────────┘
//
export default function Layout() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCollectionKey, setActiveCollectionKey] = useState<string | null>(null)
  const navigate = useNavigate()
  const toggleExpand = () => setIsExpanded((v) => !v)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // In normal WP embed mode the host page provides a fixed 32 px admin bar.
  // When expanded we take over the full viewport with fixed positioning.
  const isWP = appConfig.isWordPress

  useEffect(() => {
    if (!isWP) return
    const root = document.getElementById('gateway-raptor-root')
    if (!root) return
    root.style.marginLeft = '-20px'
  }, [isWP])

  const { data: collections = [], isLoading: isCollectionsLoading } = useQuery<WorkspaceCollection[]>({
    queryKey: ['raptor-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json() as { collections?: WorkspaceCollection[] }
      return json.collections ?? []
    },
  })

  useEffect(() => {
    const saved = window.localStorage.getItem('raptor.activeCollectionKey')
    if (saved) setActiveCollectionKey(saved)
  }, [])

  useEffect(() => {
    const match = pathname.match(/^\/collections\/([^/]+)/)
    if (!match) return
    const fromRoute = decodeURIComponent(match[1])
    setActiveCollectionKey(fromRoute)
  }, [pathname])

  useEffect(() => {
    if (activeCollectionKey) {
      window.localStorage.setItem('raptor.activeCollectionKey', activeCollectionKey)
    } else {
      window.localStorage.removeItem('raptor.activeCollectionKey')
    }
  }, [activeCollectionKey])

  useEffect(() => {
    if (!activeCollectionKey || collections.length === 0) return
    const exists = collections.some((c) => c.collection_key === activeCollectionKey)
    if (!exists) {
      setActiveCollectionKey(null)

      const inFields = /^\/collections\/[^/]+\/fields/.test(pathname)
      const inViews = /^\/collections\/[^/]+\/views/.test(pathname)
      const inForms = /^\/collections\/[^/]+\/forms/.test(pathname)

      if (inFields) void navigate({ to: '/fields' })
      if (inViews) void navigate({ to: '/views' })
      if (inForms) void navigate({ to: '/forms' })
    }
  }, [activeCollectionKey, collections, navigate, pathname])

  const handleCollectionChange = (value: string) => {
    const nextKey = value || null
    setActiveCollectionKey(nextKey)

    const inFields = /^\/collections\/[^/]+\/fields/.test(pathname)
    const inViews = /^\/collections\/[^/]+\/views/.test(pathname)
    const inForms = /^\/collections\/[^/]+\/forms/.test(pathname)

    if (!nextKey) {
      if (inFields) void navigate({ to: '/fields' })
      if (inViews) void navigate({ to: '/views' })
      if (inForms) void navigate({ to: '/forms' })
      return
    }

    if (inFields) {
      void navigate({ to: '/collections/$collectionKey/fields', params: { collectionKey: nextKey } })
    }
    if (inViews) {
      void navigate({ to: '/collections/$collectionKey/views', params: { collectionKey: nextKey } })
    }
    if (inForms) {
      void navigate({ to: '/collections/$collectionKey/forms', params: { collectionKey: nextKey } })
    }
  }

  const activeCollectionTitle = collections.find((c) => c.collection_key === activeCollectionKey)?.title

  return (
    <AppContext.Provider value={{ isExpanded, toggleExpand }}>
      <WorkspaceContext.Provider value={{ activeCollectionKey, setActiveCollectionKey, collections, isCollectionsLoading }}>
      <div
        id="gateway-raptor-canvas-host"
        className="flex text-gray-100 relative"
        style={
          isExpanded
            ? { position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'var(--app-bg)' }
            : { height: isWP ? 'calc(100vh - 32px)' : '100vh', backgroundColor: 'var(--app-bg)' }
        }
      >
        {/* ── LEFT panel — full height ──────────────────────────────── */}
        <aside className="w-48 shrink-0 border-r border-gray-800 flex flex-col h-full relative z-[1]" style={{ backgroundColor: 'var(--app-bg)' }}>
          <div className="px-4 py-4 border-b border-gray-800">
            <Header.Logo />
          </div>

          <Sidebar />
        </aside>

        {/* ── Right column: HEADER + FOOTER only ─────────── */} 
        <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
          {/* HEADER */}
          <div className="h-12 shrink-0 flex items-center justify-between px-4 relative z-[1]" style={{ backgroundColor: 'var(--app-bg)' }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">Collection</span>
              <select
                value={activeCollectionKey ?? ''}
                onChange={(e) => handleCollectionChange(e.target.value)}
                className="h-8 min-w-[240px] rounded border border-gray-700 bg-gray-900 px-2 text-xs text-gray-200"
                disabled={isCollectionsLoading}
              >
                <option value="">All Collections</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.collection_key}>
                    {c.title}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500">
                {activeCollectionTitle ?? 'Global scope'}
              </span>
            </div>
            <button
              onClick={toggleExpand}
              className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-200 transition-colors px-2 py-1"
            >
              {isExpanded ? 'Exit' : 'Expand'}
            </button>
          </div>

          {/* Outlet for other pages, transparent so Graph canvas shows through */}
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>

          {/* FOOTER */}
          <Footer className="px-6 py-2.5 border-t border-gray-800 justify-end shrink-0 relative z-[1]">
            <Footer.Credit>Raptor v0.1.0</Footer.Credit>
          </Footer>
        </div>
      </div>
      </WorkspaceContext.Provider>
    </AppContext.Provider>
  )
}
