import { useParams, useNavigate } from 'react-router-dom';
import { CollectionProvider, useCollectionRecords } from '@arcwp/gateway-data';
import { SingleView } from '@arcwp/gateway-grids';
import { useCollections } from '../context/CollectionsContext';

function RecordViewContent({ id }) {
  const { records, loading, getRecordById } = useCollectionRecords();
  const record = getRecordById(id) || records.find(r => String(r.id) === String(id));

  if (loading) {
    return <div className="gty-record-view__loading">Loading...</div>;
  }

  return <SingleView record={record} recordId={id} />;
}

function CollectionRecordView() {
  const { collectionKey, id } = useParams();
  const navigate = useNavigate();
  const { collections } = useCollections();

  const collection = collections.find((c) => c.key === collectionKey);
  const collectionLabel = collection?.titlePlural || collection?.title || collectionKey;

  const handleBack = () => navigate(`/collection/${collectionKey}`);

  return (
    <div className="gty-record-view">
      <div className="gty-record-view__back-container">
        <button onClick={handleBack} className="gty-record-view__back-button">
          <span className="gty-record-view__back-arrow">&larr;</span> Return to {collectionLabel}
        </button>
      </div>
      <CollectionProvider collectionKey={collectionKey}>
        <RecordViewContent id={id} />
      </CollectionProvider>
    </div>
  );
}

export default CollectionRecordView;
