import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@arcwp/gateway-grids';
import { useCollections } from '../context/CollectionsContext';

function Dashboard() {
  const { collections } = useCollections();
  const navigate = useNavigate();
  const { collectionKey } = useParams();
  const [viewType, setViewType] = useState('table'); // Add view state

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
          {/* Add View Switcher */}
          <div className="gty-dashboard__view-switcher">
            <button
              onClick={() => setViewType('table')}
              className={viewType === 'table' ? 'active' : ''}
            >
              Table
            </button>
            <button
              onClick={() => setViewType('board')}
              className={viewType === 'board' ? 'active' : ''}
            >
              Board
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="gty-dashboard__create-button"
          >
            Create New
          </button>
        </div>
      </div>
      <Grid 
        collectionKey={activeKey} 
        viewType={viewType}  // Pass viewType prop
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

export default Dashboard;
