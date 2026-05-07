import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { Copy, Check } from 'lucide-react'
import { apiUrl, authHeaders } from '../lib/api'
import { useSnackbar } from '../context/snackbar'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewEntry = {
  id: number
  view_key: string
  title: string
  status: string
}

type CollectionEntry = {
  id: number
  collection_key: string
  title: string
  status: string
  views: ViewEntry[]
}

type ExtensionResponse = {
  extension: { extension_key: string; title: string; status: string }
  collections: CollectionEntry[]
  plugin_active: boolean
}

type ShortcodeEntry = {
  type: 'view' | 'form'
  title: string
  key: string
  shortcode: string
  extension_key?: string
  extension_title?: string
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExtensionShortcodes() {
  const { key } = useParams({ strict: false }) as { key: string }
  const { addMessage } = useSnackbar()
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const { data: extData, isLoading: extLoading } = useQuery<ExtensionResponse>({
    queryKey: ['extensions', key],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${key}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!key,
  })

  const isActive = extData?.plugin_active ?? false

  const { data: allData, isLoading: allLoading } = useQuery<{ success: boolean; shortcodes: ShortcodeEntry[] }>({
    queryKey: ['raptor-shortcodes-all'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/shortcodes'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: extData !== undefined && !isActive,
  })

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      addMessage('Copied to clipboard', 'success')
      setTimeout(() => setCopiedText(null), 2000)
    })
  }

  // Build shortcode rows from this extension's collections + views
  const extensionRows: ShortcodeEntry[] = []
  if (extData) {
    for (const col of extData.collections) {
      extensionRows.push({
        type: 'form',
        title: col.title || col.collection_key,
        key: col.collection_key,
        shortcode: `[gateway_form schema="${col.collection_key}"]`,
      })
      for (const view of col.views) {
        extensionRows.push({
          type: 'view',
          title: view.title || view.view_key,
          key: view.view_key,
          shortcode: `[gateway_view key="${view.view_key}"]`,
        })
      }
    }
  }

  const isLoading = extLoading || (!isActive && allLoading)

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Extensions
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              {extData?.extension?.title || key}
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-0.5">{key}</p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link
              to={`/extensions/${key}` as any}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
            >
              Settings
            </Link>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium">
              Shortcodes
            </span>
          </div>
        </div>
      </div>

      {/* ── Inactive banner ─────────────────────────────────────────────── */}
      {!extLoading && !isActive && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-sm">
          This extension's plugin isn't active — showing all shortcodes across active extensions.
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : isActive ? (
        extensionRows.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4">
            No shortcodes yet. Add collections or views to this extension first.
          </p>
        ) : (
          <ShortcodeTable rows={extensionRows} copiedText={copiedText} onCopy={copy} />
        )
      ) : (
        <AllShortcodes rows={allData?.shortcodes ?? []} copiedText={copiedText} onCopy={copy} />
      )}
    </div>
  )
}

// ─── Shared table ─────────────────────────────────────────────────────────────

function ShortcodeTable({
  rows,
  copiedText,
  onCopy,
}: {
  rows: ShortcodeEntry[]
  copiedText: string | null
  onCopy: (text: string) => void
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-16">Type</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-40">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Shortcode</th>
            <th className="px-3 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {rows.map((row) => (
            <ShortcodeRow key={row.shortcode} row={row} copiedText={copiedText} onCopy={onCopy} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── All-extensions grouped view ──────────────────────────────────────────────

function AllShortcodes({
  rows,
  copiedText,
  onCopy,
}: {
  rows: ShortcodeEntry[]
  copiedText: string | null
  onCopy: (text: string) => void
}) {
  const grouped: Record<string, { title: string; rows: ShortcodeEntry[] }> = {}
  for (const row of rows) {
    const ek = row.extension_key ?? 'unknown'
    if (!grouped[ek]) grouped[ek] = { title: row.extension_title ?? ek, rows: [] }
    grouped[ek].rows.push(row)
  }

  if (Object.keys(grouped).length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-4">
        No shortcodes found. Build and activate an extension to generate shortcodes.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([ek, group]) => (
        <div key={ek}>
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-1">
            {group.title}
          </h2>
          <ShortcodeTable rows={group.rows} copiedText={copiedText} onCopy={onCopy} />
        </div>
      ))}
    </div>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function ShortcodeRow({
  row,
  copiedText,
  onCopy,
}: {
  row: ShortcodeEntry
  copiedText: string | null
  onCopy: (text: string) => void
}) {
  const isCopied = copiedText === row.shortcode

  return (
    <tr className="hover:bg-zinc-800/40 transition-colors group">
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
          row.type === 'view'
            ? 'bg-blue-950/60 text-blue-300 border-blue-900/50'
            : 'bg-purple-950/60 text-purpleple-300 border-purple-900/50 text-purple-300'
        }`}>
          {row.type === 'view' ? 'View' : 'Form'}
        </span>
      </td>
      <td className="px-4 py-3 text-zinc-300 text-sm">{row.title}</td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2.5 py-1.5 rounded select-all whitespace-nowrap">
          {row.shortcode}
        </code>
      </td>
      <td className="px-3 py-3">
        <button
          onClick={() => onCopy(row.shortcode)}
          className="p-1.5 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
          title="Copy"
        >
          {isCopied
            ? <Check size={13} className="text-emerald-400" />
            : <Copy size={13} />
          }
        </button>
      </td>
    </tr>
  )
}
