import { useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@arcwp/gateway-grid';
import { useCollections } from '../context/CollectionsContext';

function Dashboard() {
  const { collections } = useCollections();
  const navigate = useNavigate();
  const { collectionKey } = useParams();

  // If no collectionKey is provided, use the first collection
  const activeKey = collectionKey || collections[0]?.key;

  if (!activeKey) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p>No collections available</p>
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {activeKey.replace(/_/g, ' ')}
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Create New
        </button>
      </div>
      <Grid collectionKey={activeKey} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default Dashboard;
