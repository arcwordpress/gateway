import { useState } from '@wordpress/element';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CollectionCreateForm from '../components/CollectionCreateForm';
import { useActiveExtension } from '../context/ActiveExtensionContext';

const CollectionCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { key: extensionKey } = useParams();
  const { activeExtension } = useActiveExtension();

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions/${extensionKey}/collections`,
        data,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Redirect back to extension view
        navigate(`/extension/${extensionKey}`);
      } else {
        setError(response.data.message || 'Failed to create collection');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Create New Collection</h1>
      {activeExtension && (
        <p className="text-gray-600 mb-6">
          in extension: <span className="font-medium">{activeExtension.title}</span>
        </p>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      <CollectionCreateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CollectionCreate;
