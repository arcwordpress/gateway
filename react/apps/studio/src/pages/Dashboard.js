import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@arcwp/gateway-grids';
import { useCollections } from '../context/CollectionsContext';

function Dashboard() {
  const { collections, packageLabel } = useCollections();
  const navigate = useNavigate();
  const { collectionKey } = useParams();
  const [viewType, setViewType] = useState('table');

  // If no collectionKey is provided, use the first collection
  const activeKey = collectionKey || collections[0]?.key;
  const activeCollection = collections.find(c => c.key === activeKey);

  if (!activeKey) {
    return (
      <div className="dashboard">
        <p className="dashboard__no-collections">No collections available</p>
      </div>
    );
  }

  const handleEdit = (recordId) => {
    navigate(`/collection/${activeKey}/edit/${recordId}`);
  };

  const handleView = (record) => {
    navigate(`/collection/${activeKey}/view/${record.id}`);
  };

  const handleDelete = (recordId) => {
    console.log('Record deleted:', recordId);
  };

  const handleCreate = () => {
    navigate(`/collection/${activeKey}/create`);
  };

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
        <Grid
          collectionKey={activeKey}
          viewType={viewType}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default Dashboard;
