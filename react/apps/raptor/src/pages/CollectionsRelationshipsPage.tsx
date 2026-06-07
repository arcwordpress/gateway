import { CollectionsTabs } from './RegisteredCollectionsPage'
import CollectionsRelationshipsViewer from './CollectionsRelationshipsViewer'

// ─── /collections/relationships ───────────────────────────────────────────────

export default function CollectionsRelationshipsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CollectionsTabs />
      <div className="flex-1 overflow-hidden relative">
        <CollectionsRelationshipsViewer />
      </div>
    </div>
  )
}
