import { useState, useEffect } from '@wordpress/element';
import axios from 'axios';

/**
 * SortableChildrenField Component
 *
 * Displays a list of child records with drag-and-drop sorting.
 * Manages children through API calls, independent of parent form submission.
 *
 * Props:
 * - fieldName: Field name from schema
 * - fieldConfig: Field configuration including sortable_children config
 * - recordId: Parent record ID (used as filter value)
 */
const SortableChildrenField = ({ fieldName, fieldConfig, recordId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const config = fieldConfig.sortable_children || {};
  const {
    endpoint,
    updateEndpoint = endpoint,
    filterBy,
    labelField = 'title',
    positionField = 'position',
    idField = 'id',
  } = config;

  // Fetch children on mount or when recordId changes
  useEffect(() => {
    if (!recordId || !endpoint || !filterBy) {
      setLoading(false);
      return;
    }

    fetchChildren();
  }, [recordId, endpoint, filterBy]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${endpoint}?${filterBy}=${recordId}`;
      const response = await axios.get(url, {
        headers: {
          'X-WP-Nonce': window.wpApiSettings?.nonce || '',
        },
      });

      const childItems = response.data?.data?.items || [];

      // Sort by position field
      childItems.sort((a, b) => (a[positionField] || 0) - (b[positionField] || 0));

      setItems(childItems);
      setHasChanges(false);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove from old position
    newItems.splice(draggedIndex, 1);

    // Insert at new position
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Update positions for all items (1-indexed)
      const updatePromises = items.map((item, index) => {
        const newPosition = index + 1;
        const itemId = item[idField];

        // Only update if position changed
        if (item[positionField] !== newPosition) {
          return axios.patch(
            `${updateEndpoint}/${itemId}`,
            { [positionField]: newPosition },
            {
              headers: {
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
              },
            }
          );
        }

        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Refresh to get updated data
      await fetchChildren();

      setHasChanges(false);
    } catch (err) {
      console.error('Error updating positions:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchChildren();
    setHasChanges(false);
  };

  if (!recordId) {
    return (
      <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </label>
        <div className="text-sm text-gray-500">
          Save this record first to manage its children.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </label>
        <div className="text-sm text-gray-500">
          Loading {fieldConfig.label?.toLowerCase() || 'items'}...
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="border border-red-300 rounded-md p-4 bg-red-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </label>
        <div className="text-sm font-semibold text-red-600 mb-2">Error</div>
        <div className="text-sm text-red-600">{error}</div>
        <button
          onClick={fetchChildren}
          className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </label>

      {fieldConfig.helpText && (
        <p className="text-sm text-gray-500 -mt-1">{fieldConfig.helpText}</p>
      )}

      {items.length === 0 ? (
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
          <div className="text-sm text-gray-500">
            No {fieldConfig.label?.toLowerCase() || 'items'} found.
          </div>
        </div>
      ) : (
        <>
          <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
                {hasChanges && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Order'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <div
                  key={item[idField]}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-3 px-4 py-3 cursor-move transition-opacity
                    ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
                    hover:bg-gray-50
                  `}
                >
                  <div className="text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item[labelField] || 'Untitled'}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 font-mono">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="text-sm text-yellow-800">
                You have unsaved changes. Click "Save Order" to update positions.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SortableChildrenField;
