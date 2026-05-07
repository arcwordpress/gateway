import { useState, createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../lib/api'
import { BuilderLayout } from './Builders/BuilderLayout'
import { GlobalPackagesGraph, type PackageRecord, type ExtensionRecord } from './Packages/GlobalPackagesGraph'
import { PackagePanel } from './PackagePanel'

// ─── Page context ─────────────────────────────────────────────────────────
// Provides the selected extension to all children so no child depends on
// async load timing to decide whether to enable/disable the New Package button.

type SelectedExt = { key: string; id: number; title: string } | null

type PackagePageCtx = {
  selectedExt: SelectedExt
  setSelectedExt: (ext: SelectedExt) => void
}

const PackagePageContext = createContext<PackagePageCtx>({
  selectedExt: null,
  setSelectedExt: () => {},
})

const usePackagePage = () => useContext(PackagePageContext)

// ─── Persistence helpers ──────────────────────────────────────────────────

const STORAGE_KEY = 'raptor.packages.selectedExt'

function loadPersistedExt(): SelectedExt {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SelectedExt) : null
  } catch {
    return null
  }
}

function persistExt(ext: SelectedExt) {
  if (ext) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ext))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

// ─── Extensions query ─────────────────────────────────────────────────────

function useExtensions() {
  return useQuery<ExtensionRecord[]>({
    queryKey: ['extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json() as { extensions?: ExtensionRecord[] }
      return (json.extensions ?? []).map((e) => ({ ...e, id: Number(e.id) }))
    },
    staleTime: 30_000,
  })
}

// ─── Panel state ──────────────────────────────────────────────────────────

type PanelState =
  | { mode: 'create' }
  | { mode: 'edit'; packageKey: string }
  | null

// ─── Shared button class ──────────────────────────────────────────────────

const NEW_PKG_BTN =
  'flex items-center gap-1.5 h-8 px-3 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-white font-medium transition-colors'

// ─── New Package button ───────────────────────────────────────────────────
// Reads selectedExt directly from context — enabled as soon as context has
// a value, which is immediate from localStorage, no API wait required.

function NewPackageButton({ onNew }: { onNew: () => void }) {
  const { selectedExt } = usePackagePage()
  return (
    <button
      onClick={onNew}
      disabled={!selectedExt}
      title={!selectedExt ? 'Select an extension first' : 'New Package'}
      className={NEW_PKG_BTN}
    >
      <span className="text-sm leading-none">+</span>
      New Package
    </button>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────

function PackagesTopBar({
  extensions,
  viewMode,
  onViewModeChange,
  onNew,
}: {
  extensions: ExtensionRecord[]
  viewMode: 'graph' | 'list'
  onViewModeChange: (m: 'graph' | 'list') => void
  onNew: () => void
}) {
  const { selectedExt, setSelectedExt } = usePackagePage()

  const handleChange = (key: string | null) => {
    if (!key) {
      setSelectedExt(null)
      return
    }
    const ext = extensions.find((e) => e.extension_key === key)
    if (ext) {
      setSelectedExt({ key: ext.extension_key, id: ext.id, title: ext.title })
    }
  }

  return (
    <div
      className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded bg-dark backdrop-blur-sm"
      style={{ boxShadow: '0 4px 20px rgba(161,161,170,0.18)' }}
    >
      <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Extension</span>
      <select
        value={selectedExt?.key ?? ''}
        onChange={(e) => handleChange(e.target.value || null)}
        className="h-8 min-w-[200px] rounded border border-zinc-400 bg-zinc-700 px-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      >
        <option value="">All Extensions</option>
        {extensions.map((e) => (
          <option key={e.extension_key} value={e.extension_key}>
            {e.title || e.extension_key}
          </option>
        ))}
      </select>

      <NewPackageButton onNew={onNew} />

      <div className="ml-auto flex gap-1 border border-zinc-700 rounded p-1 bg-zinc-900/50">
        {(['graph', 'list'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onViewModeChange(m)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors capitalize ${viewMode === m ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Arrow icon ───────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-zinc-600 group-hover:text-zinc-300 transition-colors">
      <path d="M0.5 7.5H14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 0.5L14.5 7.5L7.5 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function PackagesTopLevel() {
  // Initialize from localStorage — button is enabled immediately if user
  // previously selected an extension, no API load required.
  const [selectedExt, setSelectedExtRaw] = useState<SelectedExt>(loadPersistedExt)
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const [panel, setPanel] = useState<PanelState>(null)

  const setSelectedExt = (ext: SelectedExt) => {
    setSelectedExtRaw(ext)
    persistExt(ext)
  }

  const { data: allPackages = [] } = useQuery<PackageRecord[]>({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/package'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return (json.packages ?? []).map((p: PackageRecord) => ({ ...p, extension_id: p.extension_id !== null ? Number(p.extension_id) : null }))
    },
    staleTime: 30_000,
  })

  const { data: extensions = [] } = useExtensions()

  // When extensions load, refresh the persisted ext with latest data (title etc.)
  // This is the only place we touch selectedExt based on API data — purely additive.
  const selectedExtFromApi = selectedExt
    ? (extensions.find((e) => e.extension_key === selectedExt.key) ?? null)
    : null

  if (selectedExtFromApi && (selectedExtFromApi.id !== selectedExt?.id || selectedExtFromApi.title !== selectedExt?.title)) {
    // Silently refresh persisted data without resetting selection
    persistExt({ key: selectedExtFromApi.extension_key, id: selectedExtFromApi.id, title: selectedExtFromApi.title })
  }

  const visiblePackages = selectedExt
    ? allPackages.filter((p) => p.extension_id === selectedExt.id)
    : allPackages

  const visibleExtensions = selectedExt
    ? extensions.filter((e) => e.extension_key === selectedExt.key)
    : extensions

  const openNew = () => {
    if (!selectedExt) return
    setPanel({ mode: 'create' })
  }

  const openEdit = (key: string) => setPanel({ mode: 'edit', packageKey: key })
  const closePanel = () => setPanel(null)

  const handleExtensionSelect = (extKey: string) => {
    const ext = extensions.find((e) => e.extension_key === extKey)
    if (ext) {
      setSelectedExt({ key: ext.extension_key, id: ext.id, title: ext.title })
    }
  }

  return (
    <PackagePageContext.Provider value={{ selectedExt, setSelectedExt }}>
      <BuilderLayout>
        {/* ── Graph ──────────────────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            viewMode === 'graph' ? 'opacity-100 pointer-events-auto' : 'opacity-25 blur-[2px] pointer-events-none'
          }`}
        >
          <GlobalPackagesGraph
            packages={visiblePackages}
            extensions={visibleExtensions.length > 0 ? visibleExtensions : extensions}
            selectedExtKey={selectedExt?.key ?? null}
            onPackageSelect={openEdit}
            onExtensionSelect={handleExtensionSelect}
          />
        </div>

        {/* ── List ───────────────────────────────────────────────────────── */}
        <div
          className={`absolute top-20 left-4 right-4 bottom-4 z-[5] transition-all duration-300 ease-out ${
            viewMode === 'list' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          <div className="w-full h-full overflow-auto rounded border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm px-8 py-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-200">Packages</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {selectedExt ? `Extension: ${selectedExt.key}` : 'All Extensions'} · {visiblePackages.length} package{visiblePackages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <NewPackageButton onNew={openNew} />
            </div>

            {!selectedExt && (
              <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-xs">
                Select an extension in the top bar to create or filter packages.
              </div>
            )}

            {visiblePackages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium text-zinc-300">No packages yet</p>
                <p className="text-xs text-zinc-500">
                  {selectedExt
                    ? 'Click + New Package above to create the first package for this extension.'
                    : 'Select an extension in the top bar, then create a package.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visiblePackages.map((pkg) => (
                  <button
                    key={pkg.package_key}
                    onClick={() => openEdit(pkg.package_key)}
                    className="group w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all text-left"
                  >
                    <span className={`dashicons ${pkg.icon ?? 'dashicons-admin-generic'} text-zinc-500 group-hover:text-zinc-400 transition-colors`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-200 group-hover:text-zinc-100">{pkg.label || pkg.package_key}</p>
                      <p className="text-xs text-zinc-600 mt-0.5 font-mono">{pkg.package_key}</p>
                      {pkg.collection_keys.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {pkg.collection_keys.map((ck) => (
                            <span key={ck} className="text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">{ck}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!pkg.has_collections && (
                      <span title="No collections assigned" className="text-[10px] text-amber-400/80 border border-amber-800/50 rounded px-1.5 py-0.5 bg-amber-950/40">
                        no collections
                      </span>
                    )}
                    <ArrowIcon />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <PackagesTopBar
          extensions={extensions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNew={openNew}
        />

        {/* ── Right panel ────────────────────────────────────────────────── */}
        {panel?.mode === 'create' && selectedExt && (
          <PackagePanel
            mode="create"
            extensionId={selectedExt.id}
            extensionTitle={selectedExt.title || selectedExt.key}
            onClose={closePanel}
            onCreated={(key) => { closePanel(); openEdit(key) }}
          />
        )}
        {panel?.mode === 'edit' && (
          <PackagePanel
            key={panel.packageKey}
            mode="edit"
            packageKey={panel.packageKey}
            onClose={closePanel}
            onDeleted={closePanel}
            onKeyChange={(newKey) => setPanel({ mode: 'edit', packageKey: newKey })}
          />
        )}
      </BuilderLayout>
    </PackagePageContext.Provider>
  )
}
