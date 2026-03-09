import { useState } from 'react'
import { formsRoute } from '../router'
import { useCollection, CollectionProvider } from './Forms/FormsPageContext'
import { FormsProvider, SurfaceState } from './Forms/FormsPageContext'
import { Editor, FormEditForm, DeleteConfirmation, EditPanel } from './Forms/FormsEditor'

function CollectionName() {
  const { collection, isLoading } = useCollection()
  if (isLoading) return <div className="h-5 w-32 rounded bg-gray-700 animate-pulse" />
  return <h1 className="!text-neutral-300 text-2xl font-bold">{collection?.title}</h1>
}

function TopBar() {
  return (
    <section className="flex gap-6 border border-neutral-600 px-6 py-3 rounded mb-12">
      <a href="https://arcwp.ca/docs">DOCS</a>
      <a href="https://arcwp.ca/support">SUPPORT</a>
    </section>
  )
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
    <section className="text-white px-12">
      <TopBar />
      <div>
        <h4 className="font-medium mb-2">COLLECTION</h4>
        <CollectionName />
      </div>
      <div className="flex flex-col gap-8 mt-12">
        <Editor setEditSurface={setEditSurface} />
        <Files />
      </div>

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
    </section>
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
