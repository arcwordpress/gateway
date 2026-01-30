import { useState, useEffect } from '@wordpress/element';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { useExtensionList } from '../context/ExtensionListContext';
import FieldEditor from '../components/FieldEditor';
import CollectionNav from '../components/CollectionNav';
import axios from 'axios';

const FieldsEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const navigate = useNavigate();
  const { activeExtension, setActiveExtension, collections, collectionsLoading, refetchCollections } = useActiveExtension();
  const { extensions } = useExtensionList();
  const [collection, setCollection] = useState(null);
  const [fields, setFields] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Set active extension based on URL param (handles page refresh)
  useEffect(() => {
    if (extensionKey && extensions.length > 0) {
      const extension = extensions.find(ext => ext.key === extensionKey);
      if (extension && (!activeExtension || activeExtension.key !== extensionKey)) {
        setActiveExtension(extension);
      }
    }
  }, [extensionKey, extensions, activeExtension, setActiveExtension]);

  useEffect(() => {
    if (!collectionsLoading && collections.length > 0) {
      const found = collections.find(c => c.key === collectionKey);
      if (found) {
        setCollection(found);
        setFields(found.fields || []);
      } else {
        setCollection(null);
      }
    }
  }, [collectionKey, collections, collectionsLoading]);

  const saveChanges = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      const response = await axios({
        method: 'PUT',
        url: `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions/${extensionKey}/collections/${collectionKey}`,
        data: { ...collection, fields },
        headers: {
          'X-WP-Nonce': window.gatewayAdminScript.nonce,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setCollection({ ...collection, fields });
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
        setError(response.data.message || 'Failed to update fields');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err.response?.data?.message || err.message || 'Failed to update fields');
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    setFields(prev => [...prev, { type: 'text', label: '', name: '' }]);
    setHasUnsavedChanges(true);
  };

  const removeField = (index) => {
    setFields(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const updateField = (index, fieldName, value) => {
    setFields(prev =>
      prev.map((field, i) =>
        i === index ? { ...field, [fieldName]: value } : field
      )
    );
    setHasUnsavedChanges(true);
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newFields.length) return;

    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];

    setFields(newFields);
    setHasUnsavedChanges(true);
  };

  if (collectionsLoading) {
    return <div className="!text-slate-500">Loading collection...</div>;
  }

  if (!collection) {
    return (
      <div>
        <h1 className="text-lg font-medium !text-slate-500 mb-4">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold !text-slate-200 mb-2">
            {collection?.title || collectionKey}
          </h1>
          {saveStatus === 'saving' && (
            <span className="text-sm !text-slate-500">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm !text-green-500">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm !text-red-500">✕ Error saving</span>
          )}
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-700 !text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            Save Changes
          </button>
        )}
      </header>

      <CollectionNav extensionKey={extensionKey} collectionKey={collectionKey} />

      {error && (
        <div className="mb-4 p-4 bg-neutral-900 border border-red-500 rounded-lg !text-red-500">
          {error}
        </div>
      )}

      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="!text-base font-medium !text-slate-400">Fields</h2>
          <button
            type="button"
            onClick={addField}
            className="px-4 py-2 bg-slate-700 !text-slate-200 rounded-lg hover:bg-slate-600 text-sm transition-colors"
          >
            + Add Field
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="!text-slate-500 text-sm">No fields yet. Click "Add Field" to create one.</p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldEditor
                key={index}
                field={field}
                index={index}
                onUpdate={updateField}
                onMove={moveField}
                onRemove={removeField}
                isFirst={index === 0}
                isLast={index === fields.length - 1}
                onBlur={() => hasUnsavedChanges && saveChanges()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldsEditor;
