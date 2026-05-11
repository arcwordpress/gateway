import { ExtensionsTabs } from './ExtensionsPage'
import ExtensionsGraph from './ExtensionsGraph'

// ─── /extensions/editor ──────────────────────────────────────────────────────

export default function ExtensionsEditorPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ExtensionsTabs />
      <div className="flex-1 relative overflow-hidden">
        <ExtensionsGraph />
      </div>
    </div>
  )
}
