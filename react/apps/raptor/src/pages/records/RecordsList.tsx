import { useNavigate, useParams } from '@tanstack/react-router'
import { Grid } from '@arcwp/gateway-grids'
import '@arcwp/gateway-forms/style.css'

export default function RecordsList() {
  const { collectionKey } = useParams({ strict: false }) as { collectionKey: string }
  const navigate = useNavigate()

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <button
          className="studio-sidebar__create"
          onClick={() =>
            void navigate({
              to: '/records/$collectionKey/create' as never,
              params: { collectionKey } as never,
            })
          }
        >
          Create
        </button>
        <button
          className="studio-sidebar__return"
          onClick={() => void navigate({ to: '/records' as never })}
        >
          <span className="studio-sidebar__return-icon" aria-hidden="true">↵</span>
          Return
        </button>
      </aside>
      <main className="studio-main">
        <Grid
          collectionKey={collectionKey}
          showFilters
          showActions
          onEdit={(id: number | string) =>
            void navigate({
              to: '/records/$collectionKey/edit/$id' as never,
              params: { collectionKey, id: String(id) } as never,
            })
          }
          onView={(record: { id: number | string }) =>
            void navigate({
              to: '/records/$collectionKey/view/$id' as never,
              params: { collectionKey, id: String(record.id) } as never,
            })
          }
        />
      </main>
    </div>
  )
}
