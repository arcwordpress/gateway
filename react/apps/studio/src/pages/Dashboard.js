import { Grid } from '@gateway/grid';
import { useCollections } from '../context/CollectionsContext';

function Dashboard({ collectionKey }) {
  const { collections } = useCollections();

  // If no collectionKey is provided, use the first collection
  const activeKey = collectionKey || collections[0]?.key;

  if (!activeKey) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p>No collections available</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Grid collectionKey={activeKey} />
    </div>
  );
}

export default Dashboard;
