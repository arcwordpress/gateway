import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { Grid } from '@arcwp/gateway-grids';
import { useCollections } from '../context/CollectionsContext';

function Dashboard() {
  const { collections, packageLabel } = useCollections();
  const navigate = useNavigate();
  const { collectionKey } = useParams();

  const activeKey = collectionKey || collections[0]?.key;

  if (!activeKey) {
    return (
      <div className="studio-layout">
        <aside className="studio-sidebar" />
        <main className="studio-main">
          <p className="studio-empty">No collections available</p>
        </main>
      </div>
    );
  }

  const handleEdit = (recordId) => navigate(`/collection/${activeKey}/edit/${recordId}`);
  const handleView = (record) => navigate(`/collection/${activeKey}/view/${record.id}`);
  const handleCreate = () => navigate(`/collection/${activeKey}/create`);

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        {packageLabel && (
          <span className="studio-sidebar__title">{packageLabel}</span>
        )}
        <button onClick={handleCreate} className="studio-sidebar__create">
          Create
        </button>
        <button onClick={() => navigate(-1)} className="studio-sidebar__return">
          <span className="studio-sidebar__return-icon" aria-hidden="true">↵</span>
          Return
        </button>
      </aside>
      <main className="studio-main">
        {collections.length > 1 && (
          <nav className="studio-collections-nav">
            {collections.map((col) => (
              <NavLink
                key={col.key}
                to={`/collection/${col.key}`}
                className={({ isActive }) =>
                  'studio-collections-nav__link' +
                  (isActive || col.key === activeKey ? ' studio-collections-nav__link--active' : '')
                }
              >
                {col.titlePlural || col.title || col.key}
              </NavLink>
            ))}
          </nav>
        )}
        <Grid
          collectionKey={activeKey}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={(id) => {}}
        />
      </main>
    </div>
  );
}

export default Dashboard;
