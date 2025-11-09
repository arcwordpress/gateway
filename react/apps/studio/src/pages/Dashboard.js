import { useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@arcwp/gateway-grids';
import { useCollections } from '../context/CollectionsContext';

function Dashboard() {
  const { collections } = useCollections();
  const navigate = useNavigate();
  const { collectionKey } = useParams();

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
    // Optional: Add any additional logic after delete (e.g., show notification)
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
        <button
          onClick={handleCreate}
          className="gty-dashboard__create-button"
        >
          Create New
        </button>
      </div>
      <Grid collectionKey={activeKey} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default Dashboard;
