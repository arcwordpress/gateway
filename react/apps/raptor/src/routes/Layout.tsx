import { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { appConfig } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/ui/Sidebar'
import { AppContext } from '../context/app'

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
  const toggleExpand = () => setIsExpanded((v) => !v)

  // In normal WP embed mode the host page provides a fixed 32 px admin bar.
  // When expanded we take over the full viewport with fixed positioning.
  const isWP = appConfig.isWordPress

  useEffect(() => {
    if (!isWP) return
    const root = document.getElementById('gateway-raptor-root')
    if (!root) return
    root.style.marginLeft = '-20px'
  }, [isWP])

  return (
    <AppContext.Provider value={{ isExpanded, toggleExpand }}>
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
          <div className="h-12 shrink-0 flex items-center justify-end px-4 relative z-[1]" style={{ backgroundColor: 'var(--app-bg)' }}>
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
    </AppContext.Provider>
  )
}
