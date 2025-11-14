import { useParams, useNavigate } from 'react-router-dom';
import { Form } from '@arcwp/gateway-forms';

function CollectionForm() {
  const { collectionKey, id } = useParams();
  const navigate = useNavigate();

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
          <span className="gty-collection-form__back-arrow">&larr;</span> Back to {collectionKey}
        </button>
      </div>

      <div className="gty-collection-form__header">
        <h2 className="gty-collection-form__title">
          {id ? 'Edit' : 'Create'} {collectionKey}
        </h2>
      </div>

      <Form collectionKey={collectionKey} recordId={id} />
    </div>
  );
}

export default CollectionForm;
