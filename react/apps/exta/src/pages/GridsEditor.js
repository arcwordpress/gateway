import { useState, useEffect } from '@wordpress/element';
import { useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { useExtensionList } from '../context/ExtensionListContext';
import FilterEditor from '../components/FilterEditor';
import ColumnEditor from '../components/ColumnEditor';
import CollectionNav from '../components/CollectionNav';
import axios from 'axios';

const GridsEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const { activeExtension, setActiveExtension, collections, collectionsLoading } = useActiveExtension();
  const { extensions } = useExtensionList();
  const [collection, setCollection] = useState(null);
  const [filters, setFilters] = useState([]);
  const [columns, setColumns] = useState([]);
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
        setFilters(found.filters || []);
        setColumns(found.columns || []);
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
        data: { ...collection, filters, columns },
        headers: {
          'X-WP-Nonce': window.gatewayAdminScript.nonce,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setCollection({ ...collection, filters, columns });
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
        setError(response.data.message || 'Failed to update grids');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err.response?.data?.message || err.message || 'Failed to update grids');
    } finally {
      setIsSaving(false);
    }
  };

  const addFilter = () => {
    setFilters(prev => [...prev, { type: 'text', field: '', label: '' }]);
    setHasUnsavedChanges(true);
  };

  const removeFilter = (index) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const updateFilter = (index, filterName, value) => {
    setFilters(prev =>
      prev.map((filter, i) =>
        i === index ? { ...filter, [filterName]: value } : filter
      )
    );
    setHasUnsavedChanges(true);
  };

  const moveFilter = (index, direction) => {
    const newFilters = [...filters];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newFilters.length) return;

    [newFilters[index], newFilters[newIndex]] = [newFilters[newIndex], newFilters[index]];

    setFilters(newFilters);
    setHasUnsavedChanges(true);
  };

  const addColumn = () => {
    setColumns(prev => [...prev, { field: '', label: '', sortable: true }]);
    setHasUnsavedChanges(true);
  };

  const removeColumn = (index) => {
    setColumns(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const updateColumn = (index, columnName, value) => {
    setColumns(prev =>
      prev.map((column, i) =>
        i === index ? { ...column, [columnName]: value } : column
      )
    );
    setHasUnsavedChanges(true);
  };

  const moveColumn = (index, direction) => {
    const newColumns = [...columns];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newColumns.length) return;

    [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];

    setColumns(newColumns);
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

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-neutral-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="!text-base font-medium !text-slate-400">Filters</h2>
            <button
              type="button"
              onClick={addFilter}
              className="px-4 py-2 bg-slate-700 !text-slate-200 rounded-lg hover:bg-slate-600 text-sm transition-colors"
            >
              + Add Filter
            </button>
          </div>

          {filters.length === 0 ? (
            <p className="!text-slate-500 text-sm">No filters yet. Click "Add Filter" to create one.</p>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <FilterEditor
                  key={index}
                  filter={filter}
                  index={index}
                  onUpdate={updateFilter}
                  onMove={moveFilter}
                  onRemove={removeFilter}
                  isFirst={index === 0}
                  isLast={index === filters.length - 1}
                  onBlur={() => hasUnsavedChanges && saveChanges()}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-neutral-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="!text-base font-medium !text-slate-400">Columns</h2>
            <button
              type="button"
              onClick={addColumn}
              className="px-4 py-2 bg-slate-700 !text-slate-200 rounded-lg hover:bg-slate-600 text-sm transition-colors"
            >
              + Add Column
            </button>
          </div>

          {columns.length === 0 ? (
            <p className="!text-slate-500 text-sm">No columns yet. Click "Add Column" to create one.</p>
          ) : (
            <div className="space-y-3">
              {columns.map((column, index) => (
                <ColumnEditor
                  key={index}
                  column={column}
                  index={index}
                  onUpdate={updateColumn}
                  onMove={moveColumn}
                  onRemove={removeColumn}
                  isFirst={index === 0}
                  isLast={index === columns.length - 1}
                  onBlur={() => hasUnsavedChanges && saveChanges()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GridsEditor;
