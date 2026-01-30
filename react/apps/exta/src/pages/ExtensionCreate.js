import { useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExtensionCreateForm from '../components/ExtensionCreateForm';
import { useExtensionList } from '../context/ExtensionListContext';

const ExtensionCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const navigate = useNavigate();
  const { refetch } = useExtensionList();

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setWarning(null);

    try {
      const response = await axios.post(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions`,
        data,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Check for activation warnings
        if (response.data.plugin_activated === false && response.data.activation_error) {
          setWarning(`Extension created but plugin activation failed: ${response.data.activation_error}`);
          // Still navigate after a delay to show the warning
          setTimeout(async () => {
            await refetch();
            const extensionKey = response.data.extension?.key || data.key;
            navigate(`/extension/${extensionKey}`);
          }, 3000);
        } else {
          // Refetch extensions list
          await refetch();
          // Redirect to the newly created extension
          const extensionKey = response.data.extension?.key || data.key;
          navigate(`/extension/${extensionKey}`);
        }
      } else {
        setError(response.data.message || 'Failed to create extension');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create extension');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New Extension</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      {warning && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          {warning}
        </div>
      )}
      <ExtensionCreateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default ExtensionCreate;
