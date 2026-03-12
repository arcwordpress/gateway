import { useState } from 'react'
import { formsRoute } from '../../router'
import { useCollection, CollectionProvider } from './FormsPageContext'
import { FormsProvider, SurfaceState } from './FormsPageContext'
import { Editor, FormEditForm, DeleteConfirmation, EditPanel } from './FormsEditor'
import { Graph } from './FormsGraph'
import { BuilderLayout } from '../Builders/BuilderLayout'
import { BuilderTopBar } from '../Builders/BuilderTopBar'
import { BuilderLeftPanel } from '../Builders/BuilderLeftPanel'

function CollectionName() {
  const { collection, isLoading } = useCollection()
  if (isLoading) return <div className="h-5 w-32 rounded bg-gray-700 animate-pulse" />
  return <h1 className="!text-zinc-300 text-2xl font-bold">{collection?.title}</h1>
}

function Files() {
  return (
    <div>
      <h2 className="!text-white text-xl font-medium mb-6">Output Files</h2>
      <article>
        <ul>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Form.php</h3>
          </li>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">FormMigration.php</h3>
          </li>
        </ul>
      </article>
    </div>
  )
}

function FormsContent({ editSurface, setEditSurface }: {
  editSurface: SurfaceState
  setEditSurface: (s: SurfaceState) => void
}) {
  const { isLoading, isError } = useCollection()

  if (isLoading) return <div className="p-8 text-gray-400">Loading collection...</div>
  if (isError) return <div className="p-8 text-red-400">Failed to load collection.</div>

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
            <h4 className="font-medium text-sm text-gray-400 mb-2">COLLECTION</h4>
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
          title={editSurface.mode === 'editForm' ? 'Edit Form' : 'Delete Form'}
          sub={editSurface.form.form_key}
          onClose={() => setEditSurface(null)}
        >
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation form={editSurface.form} onClose={() => setEditSurface(null)} />
          )}
          {editSurface.mode === 'editForm' && (
            <FormEditForm form={editSurface.form} onClose={() => setEditSurface(null)} />
          )}
        </EditPanel>
      )}
    </BuilderLayout>
  )
}

export default function FormsPage() {
  const { collectionKey } = formsRoute.useParams()
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <CollectionProvider collectionKey={collectionKey}>
      <FormsProvider>
        <FormsContent editSurface={editSurface} setEditSurface={setEditSurface} />
      </FormsProvider>
    </CollectionProvider>
  )
}
