import { useParams, useNavigate } from 'react-router-dom';
import { FormBuilder } from '@gateway/forms';

function CollectionForm() {
  const { collectionKey, id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/collection/${collectionKey}`);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
        >
          <span>&larr;</span> Back to {collectionKey}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit' : 'Create'} {collectionKey}
        </h2>
      </div>

      <FormBuilder collectionKey={collectionKey} recordId={id} />
    </div>
  );
}

export default CollectionForm;
