import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { appConfig } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/ui/Sidebar'
import { AppContext } from '../context/app'
import { WorkspaceContext, WorkspaceCollection } from '../context/workspace'
import { COLLECTIONS_NESTED_KEY, fetchCollectionsWithNested, REGISTERED_COLLECTIONS_KEY, fetchRegisteredCollections, type RegisteredCollection } from '../lib/queries'
import '../../main.css';


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
  const queryClient = useQueryClient()
  const toggleExpand = () => setIsExpanded((v) => !v)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

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
      root.style.borderLeft = ''
      root.style.borderTop = ''
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
  }, [isWP, isExpanded])

  const shellTopOffset = isExpanded ? 0 : baseTopOffset
  const shellHeightPx = isExpanded ? window.innerHeight : baseShellHeightPx
  const shellHeightCss = isExpanded ? '100vh' : `${baseShellHeightPx}px`

  // When the database is not ready (missing tables, wrong driver, etc.) route the user
  // to the connection recovery page immediately. That page reads from appConfig directly
  // (PHP-injected via wp_localize_script) and makes zero API calls, so it works even
  // when every other endpoint is returning 503.
  useEffect(() => {
    if (!appConfig.dbReady && pathname !== '/settings/connection') {
      void navigate({ to: '/settings/connection' })
    }
  }, [])

  const shouldLoadCollections = pathname === '/fields'

  const { data: collections = [], isLoading: isCollectionsLoading } = useQuery<RegisteredCollection[], Error, WorkspaceCollection[]>({
    queryKey: REGISTERED_COLLECTIONS_KEY,
    queryFn: () => fetchRegisteredCollections(false),
    enabled: shouldLoadCollections,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    select: (json) => json.map((c) => ({
      collection_key: c.key,
      title: c.titlePlural || c.title || c.key,
      is_code_defined: c.is_code_defined,
    })),
  })

  // Once the stub list is loaded, warm the nested-collections cache in the background.
  // prefetchQuery is a no-op if the data is already fresh (staleTime: 30s).
  useEffect(() => {
    if (shouldLoadCollections && collections.length > 0) {
      void queryClient.prefetchQuery({
        queryKey: COLLECTIONS_NESTED_KEY,
        queryFn: fetchCollectionsWithNested,
      })
    }
  }, [shouldLoadCollections, collections.length, queryClient])

  useEffect(() => {
    const saved = window.localStorage.getItem('raptor.activeCollectionKey')
    if (saved) setActiveCollectionKey(saved)
  }, [])

  useEffect(() => {
    const match = pathname.match(/^\/collections\/([^/]+)/)
    if (!match) return
    const fromRoute = decodeURIComponent(match[1])
    // 'registered' is a route segment, not a collection key
    if (fromRoute === 'registered') return
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

      if (inFields) void navigate({ to: '/fields' })
    }
  }, [activeCollectionKey, collections, navigate, pathname])

  return (
    <AppContext.Provider value={{ isExpanded, toggleExpand, shellTopOffset, shellHeightCss, shellHeightPx }}>
      <WorkspaceContext.Provider value={{ activeCollectionKey, setActiveCollectionKey, collections, isCollectionsLoading }}>
      <div
        id="gateway-raptor-canvas-host"
        className="flex items-stretch text-zinc-100 relative"
        style={
          isExpanded
            ? { position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'var(--gty-admin-dark)' }
            : {
                height: shellHeightCss,
                overflow: 'hidden',
                backgroundColor: 'var(--gty-admin-dark)',
                boxSizing: 'border-box',
                borderLeft: '1px solid #3f3f46',
                borderTop: '1px solid #3f3f46',
              }
        }
      >
        {/* ── LEFT panel — full height ──────────────────────────────── */}
        <aside className="w-48 shrink-0 border-r border-zinc-800 flex flex-col self-stretch relative z-1" style={{ backgroundColor: 'var(--gty-admin-dark)' }}>
          <div className="px-4 py-4 border-b border-zinc-800">
            <Header.Logo />
          </div>

          <Sidebar isExpanded={isExpanded} onToggleExpand={toggleExpand} />
        </aside>

        {/* ── Right column: content area ─────────── */} 
        <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
          {/* Outlet for pages */}
          <div id="gateway-raptor-outlet" className="gateway-raptor-outlet relative flex-1 overflow-y-auto min-h-0">
            <Outlet />
          </div>

          {/* FOOTER */}
          <Footer className="px-6 py-2.5 border-t border-zinc-800 justify-end shrink-0 relative z-1" style={{ backgroundColor: 'var(--gty-admin-dark)' }}>
            <Footer.Credit>Raptor v0.1.0</Footer.Credit>
          </Footer>
        </div>
      </div>
      </WorkspaceContext.Provider>
    </AppContext.Provider>
  )
}
