import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Maximize2, Minimize2 } from 'lucide-react'
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
  const [baseTopOffset, setBaseTopOffset] = useState(0)
  const [baseShellHeightPx, setBaseShellHeightPx] = useState(0)
  const navigate = useNavigate()
  const toggleExpand = () => setIsExpanded((v) => !v)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isDashboardRoute = pathname === '/'

  // In normal WP embed mode the host page provides a fixed 32 px admin bar.
  // When expanded we take over the full viewport with fixed positioning.
  const isWP = appConfig.isWordPress
  useEffect(() => {
    const updateShellGeometry = () => {
      const wpAdminBar = document.getElementById('wpadminbar')
      const topbarHeight = isWP ? (wpAdminBar ? wpAdminBar.offsetHeight : 32) : 0
      const available = Math.max(window.innerHeight - topbarHeight, 0)
      setBaseTopOffset(topbarHeight)
      setBaseShellHeightPx(available)
    }

    updateShellGeometry()
    window.addEventListener('resize', updateShellGeometry)

    const root = document.getElementById('gateway-raptor-root')
    if (root) {
      root.style.marginLeft = '-20px'
      root.style.boxSizing = 'border-box'
      root.style.borderLeft = '1px solid #4b5563'
    }

    // Hide WordPress footer completely
    const wpFooter = document.getElementById('wpfooter')
    if (wpFooter) {
      wpFooter.style.display = 'none'
    }

    // Remove all padding from wpbody-content
    const wpBodyContent = document.querySelector('#wpbody-content') as HTMLElement
    if (wpBodyContent) {
      wpBodyContent.style.paddingBottom = '0'
    }

    return () => {
      window.removeEventListener('resize', updateShellGeometry)
    }
  }, [isWP])

  const shellTopOffset = isExpanded ? 0 : baseTopOffset
  const shellHeightPx = isExpanded ? window.innerHeight : baseShellHeightPx
  const shellHeightCss = isExpanded ? '100vh' : `${baseShellHeightPx}px`

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
    <AppContext.Provider value={{ isExpanded, toggleExpand, shellTopOffset, shellHeightCss, shellHeightPx }}>
      <WorkspaceContext.Provider value={{ activeCollectionKey, setActiveCollectionKey, collections, isCollectionsLoading }}>
      <div
        id="gateway-raptor-canvas-host"
        className="flex items-stretch text-gray-100 relative"
        style={
          isExpanded
            ? { position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'var(--app-bg)' }
            : { height: shellHeightCss, backgroundColor: 'var(--app-bg)' }
        }
      >
        {/* ── LEFT panel — full height ──────────────────────────────── */}
        <aside className="w-48 shrink-0 border-r border-gray-800 flex flex-col h-full relative z-[1]" style={{ backgroundColor: 'var(--app-bg)' }}>
          <div className="px-4 py-4 border-b border-gray-800">
            <Header.Logo />
          </div>

          <Sidebar />

          <div className="p-3">
            <button
              onClick={toggleExpand}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-200 transition-colors px-2 py-1.5 rounded hover:bg-gray-800"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </aside>

        {/* ── Right column: HEADER + FOOTER only ─────────── */} 
        <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
          {/* HEADER */}
          <div
            className="h-12 shrink-0 flex items-center px-4 relative z-[1]"
            style={{ backgroundColor: 'var(--app-bg)' }}
          >
            {!isDashboardRoute ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Collection</span>
                <select
                  value={activeCollectionKey ?? ''}
                  onChange={(e) => handleCollectionChange(e.target.value)}
                  className="h-8 min-w-[240px] rounded border border-gray-700 bg-[#0f1216] px-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  disabled={isCollectionsLoading}
                >
                  <option value="">All Collections</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.collection_key}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-gray-300">
                  {activeCollectionTitle ?? 'Global scope'}
                </span>
              </div>
            ) : null}
          </div>

          {/* Outlet for other pages, transparent so Graph canvas shows through */}
          <div id="gateway-raptor-outlet" className="relative flex-1 overflow-y-auto min-h-0">
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
