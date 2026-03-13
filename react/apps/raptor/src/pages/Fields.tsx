import { useState } from 'react'
import { fieldsRoute } from '../router'
import { useCollection, CollectionProvider, FieldsProvider, SurfaceState } from './Fields/FieldsPageContext'
import { Editor, EditPanel, FieldEditForm, DeleteConfirmation } from './Fields/FieldsEditor'
import { Graph } from './Fields/FieldsGraph'
import { BuilderLayout } from './Builders/BuilderLayout'
import { BuilderTopBar } from './Builders/BuilderTopBar'
import { BuilderLeftPanel } from './Builders/BuilderLeftPanel'

// ─── Collection name ──────────────────────────────────────────────────────────

function CollectionName() {
  const { collection, isLoading } = useCollection()
  if (isLoading) return <div className="h-5 w-32 rounded bg-zinc-700 animate-pulse" />
  return <h1 className="!text-zinc-300 text-2xl font-bold">{collection?.title}</h1>
}

// ─── Files ────────────────────────────────────────────────────────────────────

function Files() {
  return (
    <div>
      <h2 className="!text-white text-xl font-medium mb-6">Output Files</h2>
      <article>
        <ul>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Event.php</h3>
          </li>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Migrate.php</h3>
          </li>
        </ul>
      </article>
    </div>
  )
}

// ─── Inner page (renders after collection resolves) ───────────────────────────

function FieldsContent({ editSurface, setEditSurface }: {
  editSurface: SurfaceState
  setEditSurface: (s: SurfaceState) => void
}) {
  const { isLoading, isError } = useCollection()

  if (isLoading) return (
    <BuilderLayout>
      <BuilderTopBar />
      <BuilderLeftPanel>
        <div className="p-6">
          {/* Collection label + title */}
          <div className="mb-8">
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse mb-2" />
            <div className="h-7 w-36 rounded bg-zinc-700 animate-pulse" />
          </div>
          {/* Field list header */}
          <div className="flex justify-between items-center mb-10">
            <div className="h-6 w-24 rounded bg-zinc-700 animate-pulse" />
            <div className="h-8 w-8 rounded bg-zinc-800 animate-pulse" />
          </div>
          {/* Field item skeletons */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </BuilderLeftPanel>
    </BuilderLayout>
  )
  if (isError)   return <div className="p-8 text-red-400">Failed to load collection.</div>

  return (
    <BuilderLayout>
      {/* Edge-to-edge graph background */}
      <Graph />

      {/* Floating top bar with collection switcher */}
      <BuilderTopBar />

      {/* Floating left panel with editor and files */}
      <BuilderLeftPanel>
        <div className="p-6">
          <div className="mb-8">
            <h4 className="font-medium text-sm text-zinc-400 mb-2">COLLECTION</h4>
            <CollectionName />
          </div>
          <div className="flex flex-col gap-8">
            <Editor setEditSurface={setEditSurface} />
            <Files />
          </div>
        </div>
      </BuilderLeftPanel>

      {/* Edit panel overlay */}
      {editSurface && (
        <EditPanel
          title={editSurface.mode === 'editField' ? 'Edit Field' : 'Delete Field'}
          sub={editSurface.field.name}
          onClose={() => setEditSurface(null)}
        >
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
          {editSurface.mode === 'editField' && (
            <FieldEditForm field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
        </EditPanel>
      )}
    </BuilderLayout>
  )
}

/*************************/
/* FIELDS DEFAULT RENDER */
/*************************/

export default function Fields() {
  const { collectionKey } = fieldsRoute.useParams()
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <CollectionProvider collectionKey={collectionKey}>
      <FieldsProvider>
        <FieldsContent editSurface={editSurface} setEditSurface={setEditSurface} />
      </FieldsProvider>
    </CollectionProvider>
  )
}
