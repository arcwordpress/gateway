import { useParams, useNavigate } from 'react-router-dom';
import { Form } from '@arcwp/gateway-forms';
import { useCollections } from '../context/CollectionsContext';

function CollectionForm() {
  const { collectionKey, id } = useParams();
  const navigate = useNavigate();
  const { collections } = useCollections();

  const collection = collections.find((c) => c.key === collectionKey);
  const collectionLabel = collection?.titlePlural || collection?.title || collectionKey;

  const handleBack = () => {
    navigate(`/collection/${collectionKey}`);
  };

  return (
    <div className="gty-collection-form">
      <div className="gty-collection-form__back-container">
        <button
          onClick={handleBack}
          className="gty-collection-form__back-button"
        >
          <span className="gty-collection-form__back-arrow">&larr;</span> Return to {collectionLabel}
        </button>
      </div>

      <div className="gty-collection-form__header">
        <h2 className="gty-collection-form__title">
          {id ? 'Edit Record' : 'Create Record'}
        </h2>
      </div>

      <Form collectionKey={collectionKey} recordId={id} />
    </div>
  );
}

export default CollectionForm;
