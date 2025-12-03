import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, ViewSwitcher } from '@arcwp/gateway-grids'; // Import ViewSwitcher
import { useCollections } from '../context/CollectionsContext';

function Dashboard() {
  const { collections } = useCollections();
  const navigate = useNavigate();
  const { collectionKey } = useParams();
  const [viewType, setViewType] = useState('table');

  // If no collectionKey is provided, use the first collection
  const activeKey = collectionKey || collections[0]?.key;

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

  const handleDelete = (recordId) => {
    console.log('Record deleted:', recordId);
  };

  const handleCreate = () => {
    navigate(`/collection/${activeKey}/create`);
  };

  return (
    <div className="gty-dashboard">
      <div className="gty-dashboard__header">
        <h1 className="gty-dashboard__title">
          {activeKey.replace(/_/g, ' ')}
        </h1>
        <div className="gty-dashboard__actions">
          <button
            onClick={handleCreate}
            className="gty-dashboard__create-button"
          >
            Create
          </button>
        </div>
      </div>
      {/* Place ViewSwitcher right above the Grid */}
      <ViewSwitcher
        currentView={viewType}
        onViewChange={setViewType}
        enabledViews={['table', 'list', 'cards', 'board']}
      />
      <Grid 
        collectionKey={activeKey} 
        viewType={viewType}
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

export default Dashboard;
