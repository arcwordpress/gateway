import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { Copy, Check } from 'lucide-react'
import { fetchRegisteredCollections, REGISTERED_COLLECTIONS_KEY } from '../lib/queries'
import { useSnackbar } from '../context/snackbar'

// ─── Types ────────────────────────────────────────────────────────────────────

type ShortcodeEntry = {
  title: string
  key: string
  shortcode: string
  extension_key?: string
  extension_title?: string
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExtensionShortcodesPage() {
  const { key } = useParams({ strict: false }) as { key: string }
  const { addMessage } = useSnackbar()
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const { data: collections = [], isLoading: allLoading } = useQuery({
    queryKey: REGISTERED_COLLECTIONS_KEY,
    queryFn: () => fetchRegisteredCollections(false),
    enabled: !!key,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      addMessage('Copied to clipboard', 'success')
      setTimeout(() => setCopiedText(null), 2000)
    })
  }

  const allRows: ShortcodeEntry[] = collections.map((collection) => ({
    title: collection.titlePlural || collection.title || collection.key,
    key: collection.key,
    shortcode: `[gateway_grid schema="${collection.key}"]`,
    extension_key: collection.package || 'registered',
    extension_title: collection.package || 'Registered Collections',
  }))
  const extensionRows = allRows.filter((row) => row.extension_key === key)
  const hasPackageMatch = extensionRows.length > 0

  const isLoading = allLoading

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Extensions
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 mb-2!">
              {key}
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-0!">{key}</p>
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

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : hasPackageMatch ? (
        extensionRows.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4">
            No grid shortcodes yet. Register collections for this extension first.
          </p>
        ) : (
          <ShortcodeTable rows={extensionRows} copiedText={copiedText} onCopy={copy} />
        )
      ) : (
        <AllShortcodes rows={allRows} copiedText={copiedText} onCopy={copy} />
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
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
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
