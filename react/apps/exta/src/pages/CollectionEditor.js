import { useState, useEffect } from '@wordpress/element';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import axios from 'axios';

const CollectionEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const navigate = useNavigate();
  const { activeExtension, collections, collectionsLoading, refetchCollections } = useActiveExtension();
  const [collection, setCollection] = useState(null);
  const [formData, setFormData] = useState({ title: '', key: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!collectionsLoading && collections.length > 0) {
      const found = collections.find(c => c.key === collectionKey);
      if (found) {
        setCollection(found);
        setFormData({
          title: found.title || '',
          key: found.key || '',
        });
      } else {
        setCollection(null);
      }
    }
  }, [collectionKey, collections, collectionsLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios({
        method: 'PUT',
        url: `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions/${extensionKey}/collections/${collectionKey}`,
        data: { ...collection, ...formData },
        headers: {
          'X-WP-Nonce': window.gatewayAdminScript.nonce,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setSuccessMessage('Collection updated successfully');
        await refetchCollections();
        
        // If key changed, navigate to new URL
        if (response.data.key_changed) {
          setTimeout(() => {
            navigate(`/extension/${extensionKey}/${response.data.new_key}`);
          }, 1000);
        }
      } else {
        setError(response.data.message || 'Failed to update collection');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      // Auto-generate key from title
      const generatedKey = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setFormData(prev => ({ ...prev, title: value, key: generatedKey }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (collectionsLoading) {
    return <div>Loading collection...</div>;
  }

  if (!collection) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
        <button
          onClick={() => navigate(`/extension/${extensionKey}`)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Back to Extension
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(`/extension/${extensionKey}`)}
          className="text-gray-600 hover:text-gray-800 mb-2"
        >
          ← Back to {activeExtension?.title || 'Extension'}
        </button>
        <h1 className="text-2xl font-bold">Edit Collection</h1>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Collection Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter collection title"
              />
            </div>

            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <input
                id="key"
                name="key"
                type="text"
                value={formData.key}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="collection_key"
              />
              {formData.key !== collectionKey && (
                <p className="mt-1 text-sm text-amber-600">
                  Warning: Changing the key will rename the collection file
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Collection Data</h2>
          <pre className="p-4 bg-gray-50 rounded-lg overflow-auto">
            {JSON.stringify(collection, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditor;
