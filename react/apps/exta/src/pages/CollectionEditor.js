import { useState, useEffect } from '@wordpress/element';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { useExtensionList } from '../context/ExtensionListContext';
import CollectionNav from '../components/CollectionNav';
import axios from 'axios';

const ThreeDotsIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
      <circle cx="8" cy="2" r="1.5" fill="currentColor"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  );
};

const CollectionEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const navigate = useNavigate();
  const { activeExtension, setActiveExtension, collections, collectionsLoading, refetchCollections } = useActiveExtension();
  const { extensions } = useExtensionList();
  const [collection, setCollection] = useState(null);
  const [formData, setFormData] = useState({ title: '', key: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

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
        setFormData({
          title: found.title || '',
          key: found.key || '',
        });
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
        data: { ...collection, ...formData },
        headers: {
          'X-WP-Nonce': window.gatewayAdminScript.nonce,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Update local collection state with saved data
        setCollection({ ...collection, ...formData });
        
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000);
        
        // If key changed, navigate to new URL
        if (response.data.key_changed) {
          setTimeout(() => {
            navigate(`/extension/${extensionKey}/collection/${response.data.new_key}`);
          }, 1000);
        }
      } else {
        setSaveStatus('error');
        setError(response.data.message || 'Failed to update collection');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err.response?.data?.message || err.message || 'Failed to update collection');
    } finally {
      setIsSaving(false);
    }
  };

  // Autosave with debounce
  useEffect(() => {
    if (!hasUnsavedChanges || !collection) return;

    const timeoutId = setTimeout(() => {
      saveChanges();
    }, 1500); // Wait 1.5 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [formData, hasUnsavedChanges]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.relative')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
    <div>
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="!text-lg font-medium !text-slate-500">
            {formData.title} ({formData.key})
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

        <div className="flex items-center gap-4">
          <button
            onClick={() => setJsonModalOpen(true)}
            className="px-4 py-2 bg-neutral-800 !text-slate-300 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
          >
            JSON
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ThreeDotsIcon />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-slate-600 rounded-lg shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: Implement rename
                  }}
                  className="w-full px-4 py-2 text-left !text-slate-300 hover:bg-neutral-800 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: Implement change key
                  }}
                  className="w-full px-4 py-2 text-left !text-slate-300 hover:bg-neutral-800 transition-colors"
                >
                  Change Key
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: Implement delete
                  }}
                  className="w-full px-4 py-2 text-left !text-red-400 hover:bg-neutral-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <CollectionNav extensionKey={extensionKey} collectionKey={collectionKey} />

      {error && (
        <div className="mb-4 p-4 bg-neutral-900 border border-red-500 rounded-lg !text-red-500">
          {error}
        </div>
      )}

      <div className="bg-neutral-900 rounded-lg p-6 max-w-2xl">
        <h2 className="!text-base font-medium !text-slate-400 mb-6">Collection Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-slate-400 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Collection Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium !text-slate-400 mb-2">
              Key
            </label>
            <input
              type="text"
              name="key"
              value={formData.key}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="collection_key"
            />
            <p className="mt-1 text-xs !text-slate-500">
              Auto-generated from title. Use lowercase letters, numbers, and underscores only.
            </p>
          </div>
        </div>
      </div>

      {jsonModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setJsonModalOpen(false)}
        >
          <div
            className="bg-neutral-900 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="!text-lg font-medium !text-slate-200">Collection Data</h2>
              <button
                onClick={() => setJsonModalOpen(false)}
                className="p-2 !text-slate-400 hover:!text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <pre className="p-4 bg-neutral-800 !text-slate-300 rounded-lg overflow-auto">
              {JSON.stringify(collection, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionEditor;
