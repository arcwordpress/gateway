import { useNavigate, useParams } from '@tanstack/react-router'
import { CollectionProvider, useCollectionRecords } from '@arcwp/gateway-data'
import { SingleView } from '@arcwp/gateway-grids'
import '@arcwp/gateway-forms/style.css'

function RecordViewContent({ id }: { id: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { records, loading, getRecordById } = useCollectionRecords() as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = getRecordById(id) ?? records.find((r: any) => String(r.id) === id)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 text-sm">Loading record…</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 text-sm">Record not found.</p>
      </div>
    )
  }

  return <SingleView record={record} recordId={id} />
}

export default function RecordView() {
  const { collectionKey, id } = useParams({ strict: false }) as {
    collectionKey: string
    id: string
  }
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() =>
            void navigate({
              to: '/records/$collectionKey' as never,
              params: { collectionKey } as never,
            })
          }
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {collectionKey}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">Record #{id}</span>
      </div>

      <div className="px-6 py-4">
        <CollectionProvider collectionKey={collectionKey}>
          <RecordViewContent id={id} />
        </CollectionProvider>
      </div>
    </div>
  )
}
