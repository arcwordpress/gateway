import { useState } from 'react'
import { viewsRoute } from '../router'
import { useCollection, CollectionProvider, ViewsProvider, SurfaceState } from './Views/ViewsPageContext'
import { Editor, ViewEditForm, DeleteConfirmation, EditPanel } from './Views/ViewsEditor'
import { Graph } from './Views/ViewsGraph'
import { BuilderLayout } from './Builders/BuilderLayout'
import { BuilderTopBar } from './Builders/BuilderTopBar'
import { BuilderLeftPanel } from './Builders/BuilderLeftPanel'

function CollectionName() {
  const { collection, isLoading } = useCollection()
  if (isLoading) return <div className="h-5 w-32 rounded bg-zinc-700 animate-pulse" />
  return <h1 className="!text-zinc-300 text-2xl font-bold">{collection?.title}</h1>
}

function ViewsContent({ editSurface, setEditSurface }: {
  editSurface: SurfaceState
  setEditSurface: (s: SurfaceState) => void
}) {
  const { isLoading, isError } = useCollection()
  const [showPanel, setShowPanel] = useState(true)

  if (isLoading) return <div className="p-8 text-zinc-400">Loading collection...</div>
  if (isError) return <div className="p-8 text-red-400">Failed to load collection.</div>

  return (
    <BuilderLayout>
      {/* Edge-to-edge graph background */}
      <Graph />

      {/* Floating top bar with collection switcher */}
      <BuilderTopBar showPanel={showPanel} onTogglePanel={() => setShowPanel(p => !p)} />

      {/* Floating left panel with editor and files */}
      {showPanel && (
        <BuilderLeftPanel>
          <div className="p-6">
            <div className="mb-8">
              <h4 className="font-medium text-sm text-zinc-400 mb-2">COLLECTION</h4>
              <CollectionName />
            </div>
            <div className="flex flex-col gap-8">
              <Editor setEditSurface={setEditSurface} />
            </div>
          </div>
        </BuilderLeftPanel>
      )}

      {/* Edit panel overlay */}
      {editSurface && (
        <EditPanel
          title={editSurface.mode === 'editView' ? 'Edit View' : 'Delete View'}
          sub={editSurface.view.view_key}
          onClose={() => setEditSurface(null)}
        >
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation view={editSurface.view} onClose={() => setEditSurface(null)} />
          )}
          {editSurface.mode === 'editView' && (
            <ViewEditForm view={editSurface.view} onClose={() => setEditSurface(null)} />
          )}
        </EditPanel>
      )}
    </BuilderLayout>
  )
}

export default function ViewsPage() {
  const { collectionKey } = viewsRoute.useParams()
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <CollectionProvider collectionKey={collectionKey}>
      <ViewsProvider>
        <ViewsContent editSurface={editSurface} setEditSurface={setEditSurface} />
      </ViewsProvider>
    </CollectionProvider>
  )
}
