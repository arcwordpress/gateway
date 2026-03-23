import { useState } from 'react'
import MethodBadge from './MethodBadge'
import routeTypeLabel from './routes/routeTypeLabel'

type RouteInfo = {
  type: string
  method: string
  route: string
  displayRoute: string
  namespace: string
  path: string
}

type GatewayCollection = {
  key: string
  title: string
  titlePlural: string
  className: string
  fqcn: string
  table: string
  record_count: number
  routes: RouteInfo[]
}

export default function CollectionCard({
  collection,
  onGenerateMigration,
  onRunMigration,
  onTestRoute,
}: {
  collection: GatewayCollection
  onGenerateMigration: () => void
  onRunMigration: () => void
  onTestRoute: (route: RouteInfo) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {/* Card header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-zinc-100 font-semibold text-sm">{collection.title}</h3>
            <code className="text-[11px] text-zinc-500 font-mono">{collection.key}</code>
          </div>
          {typeof collection.record_count === 'number' && (
            <div className="text-right">
              <div className="text-xs text-zinc-500">Records</div>
              <div className="text-sm font-semibold text-zinc-200">{collection.record_count.toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 mb-3">
          <div>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Class</span>
            <code className="block text-[11px] text-zinc-400 font-mono truncate">{collection.fqcn}</code>
          </div>
          <div>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Table</span>
            <code className="block text-[11px] text-zinc-400 font-mono">{collection.table}</code>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onGenerateMigration}
            className="flex-1 px-2.5 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
          >
            Generate Migration
          </button>
          <button
            onClick={onRunMigration}
            className="flex-1 px-2.5 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
          >
            Run Migration
          </button>
        </div>
      </div>

      {/* Routes toggle */}
      {collection.routes.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full px-4 py-2 flex justify-between items-center border-t border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-colors"
          >
            <span>{collection.routes.length} route{collection.routes.length !== 1 ? 's' : ''}</span>
            <span>{expanded ? '▲' : '▼'}</span>
          </button>

          {expanded && (
            <div className="border-t border-zinc-800/60 divide-y divide-zinc-800/60">
              {collection.routes.map((route, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MethodBadge method={route.method} />
                    <div className="min-w-0">
                      <code className="text-[11px] text-zinc-300 block truncate">{route.displayRoute}</code>
                      <span className="text-[10px] text-zinc-600">{routeTypeLabel(route.type)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onTestRoute(route)}
                    className="shrink-0 px-2.5 py-1 text-[10px] rounded bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 border border-zinc-700/40 transition-colors"
                  >
                    Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}