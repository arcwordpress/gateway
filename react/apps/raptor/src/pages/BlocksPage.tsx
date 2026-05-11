export default function BlocksPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl! font-semibold text-zinc-100 mb-2!">Blocks</h1>
        <p className="text-sm text-zinc-500">
          Gateway provides a Gutenberg block named <span className="text-zinc-300 font-medium">Gateway Grid</span>.
        </p>
      </div>

      <div className="border border-zinc-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Gateway Grid</h2>
          <p className="text-sm text-zinc-500">
            In the block inserter, type <span className="text-zinc-300 font-mono">gat</span> to quickly find it.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Block Name</p>
          <code className="inline-block text-xs font-mono text-zinc-300 bg-zinc-800 px-2.5 py-1.5 rounded">
            gateway/grid
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Typical Block Comment</p>
          <pre className="text-xs font-mono text-zinc-300 bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 overflow-x-auto">
{`<!-- wp:gateway/grid {"collectionSlug":"your-schema-key"} /-->`}
          </pre>
        </div>
      </div>
    </div>
  )
}
