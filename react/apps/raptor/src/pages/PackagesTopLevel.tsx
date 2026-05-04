import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'
import { BuilderLayout } from './Builders/BuilderLayout'
import { GlobalPackagesGraph, type PackageRecord, type ExtensionRecord } from './Packages/GlobalPackagesGraph'

// ─── Extension selector top bar ──────────────────────────────────────────────

function PackagesTopBar({
  extensions,
  selectedExtKey,
  onExtChange,
  viewMode,
  onViewModeChange,
}: {
  extensions: ExtensionRecord[]
  selectedExtKey: string | null
  onExtChange: (key: string | null) => void
  viewMode: 'graph' | 'list'
  onViewModeChange: (m: 'graph' | 'list') => void
}) {
  return (
    <div
      className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded bg-dark backdrop-blur-sm"
      style={{ boxShadow: '0 4px 20px rgba(161,161,170,0.18)' }}
    >
      <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Extension</span>
      <select
        value={selectedExtKey ?? ''}
        onChange={(e) => onExtChange(e.target.value || null)}
        className="h-8 min-w-[240px] rounded border border-zinc-400 bg-zinc-700 px-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      >
        <option value="">All Extensions</option>
        {extensions.map((e) => (
          <option key={e.extension_key} value={e.extension_key}>
            {e.title || e.extension_key}
          </option>
        ))}
      </select>

      <Link
        to={'/packages/create' as never}
        className="flex items-center gap-1 h-8 px-3 rounded bg-zinc-700 hover:bg-zinc-600 text-xs text-white font-medium transition-colors"
      >
        <span className="text-sm leading-none">+</span>
        New Package
      </Link>

      <div className="ml-auto flex gap-1 border border-zinc-700 rounded p-1 bg-zinc-900/50">
        <button
          onClick={() => onViewModeChange('graph')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            viewMode === 'graph' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Graph
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          List
        </button>
      </div>
    </div>
  )
}

// ─── Arrow icon ───────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-zinc-600 group-hover:text-zinc-300 transition-colors">
      <path d="M0.5 7.5H14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 0.5L14.5 7.5L7.5 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PackagesTopLevel() {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const [selectedExtKey, setSelectedExtKey] = useState<string | null>(null)

  const { data: allPackages = [] } = useQuery<PackageRecord[]>({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/package'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.packages ?? []
    },
  })

  const { data: extensions = [] } = useQuery<ExtensionRecord[]>({
    queryKey: ['extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extensions ?? []
    },
  })

  const visiblePackages = selectedExtKey
    ? allPackages.filter((p) => p.extension_key === selectedExtKey)
    : allPackages

  return (
    <BuilderLayout>
      {/* ── Graph view ─────────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          viewMode === 'graph'
            ? 'opacity-100 blur-0 pointer-events-auto'
            : 'opacity-25 blur-[2px] pointer-events-none'
        }`}
      >
        <GlobalPackagesGraph packages={visiblePackages} extensions={extensions} />
      </div>

      {/* ── List view ──────────────────────────────────────────────────── */}
      <div
        className={`absolute top-20 left-4 right-4 bottom-4 z-[5] transition-all duration-300 ease-out ${
          viewMode === 'list'
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <div className="w-full h-full overflow-auto rounded border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm px-8 py-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-200">Packages</h1>
              <p className="text-sm text-zinc-400 mt-1">
                {selectedExtKey ? `Extension: ${selectedExtKey}` : 'All Extensions'} · {visiblePackages.length} package{visiblePackages.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to={'/packages/create' as never}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm text-white font-medium transition-colors"
            >
              <span className="text-base leading-none">+</span>
              New Package
            </Link>
          </div>

          {visiblePackages.length === 0 ? (
            <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
              No packages found{selectedExtKey ? ' for this extension' : ''}.
            </div>
          ) : (
            <div className="space-y-2">
              {visiblePackages.map((pkg) => (
                <Link
                  key={pkg.package_key}
                  to={`/packages/${pkg.package_key}/edit` as never}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all"
                >
                  <span className={`dashicons ${pkg.icon ?? 'dashicons-admin-generic'} text-zinc-500 group-hover:text-zinc-400 transition-colors`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-200 group-hover:text-zinc-100">
                      {pkg.label || pkg.package_key}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 font-mono">{pkg.package_key}</p>
                  </div>
                  <ArrowIcon />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <PackagesTopBar
        extensions={extensions}
        selectedExtKey={selectedExtKey}
        onExtChange={setSelectedExtKey}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </BuilderLayout>
  )
}
