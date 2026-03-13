import { CollectionsTabs } from './CollectionsPage'
import GatewayCollections from './GatewayCollections'

// ─── /collections/registered ─────────────────────────────────────────────────

export default function RegisteredCollectionsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CollectionsTabs />
      <div className="flex-1 overflow-hidden">
        <GatewayCollections />
      </div>
    </div>
  )
}
