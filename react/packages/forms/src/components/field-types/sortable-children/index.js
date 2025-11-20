import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import { getApiClient } from '@arcwp/gateway-data';
import './style.css';

const SortableChildrenFieldTypeInput = ({ config = {}, recordId }) => {
  const { formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('SortableChildrenFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context (though this field may not use validation errors)
  const fieldError = formState.errors[name];

  // Note: This field doesn't use setValue/watch/register as it manages its own state
  // It's a special field that manages children records externally

  const {
    label,
    help = '',
    sortable_children: sortableConfig = {},
  } = config;
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    endpoint,
    updateEndpoint = endpoint,
    filterBy,
    labelField = 'title',
    positionField = 'position',
    idField = 'id',
  } = sortableConfig;

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
      const client = getApiClient();
      const response = await client.get(url);

      const childItems = response.data?.data?.items || [];

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

    newItems.splice(draggedIndex, 1);
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
      const client = getApiClient();
      const updatePromises = items.map((item, index) => {
        const newPosition = index + 1;
        const itemId = item[idField];

        if (item[positionField] !== newPosition) {
          return client.patch(
            `${updateEndpoint}/${itemId}`,
            { [positionField]: newPosition }
          );
        }

        return Promise.resolve();
      });

      await Promise.all(updatePromises);
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

  const fieldLabel = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (!recordId) {
    return (
      <div className="sortable-children-field__placeholder">
        <label className="sortable-children-field__label">
          {fieldLabel}
        </label>
        <div className="sortable-children-field__message">
          Save this record first to manage its children.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="sortable-children-field__placeholder">
        <label className="sortable-children-field__label">
          {fieldLabel}
        </label>
        <div className="sortable-children-field__message">
          Loading {label?.toLowerCase() || 'items'}...
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="sortable-children-field__error-container">
        <label className="sortable-children-field__label">
          {fieldLabel}
        </label>
        <div className="sortable-children-field__error-title">Error</div>
        <div className="sortable-children-field__error-message">{error}</div>
        <button
          onClick={fetchChildren}
          className="sortable-children-field__button sortable-children-field__button--retry"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sortable-children-field">
      <label className="sortable-children-field__label">
        {fieldLabel}
      </label>

      {help && (
        <p className="sortable-children-field__help">{help}</p>
      )}

      {items.length === 0 ? (
        <div className="sortable-children-field__empty">
          <div className="sortable-children-field__message">
            No {label?.toLowerCase() || 'items'} found.
          </div>
        </div>
      ) : (
        <>
          <div className="sortable-children-field__container">
            <div className="sortable-children-field__header">
              <div className="sortable-children-field__count">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </div>
              {hasChanges && (
                <div className="sortable-children-field__actions">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="sortable-children-field__button sortable-children-field__button--cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="sortable-children-field__button sortable-children-field__button--save"
                  >
                    {saving ? 'Saving...' : 'Save Order'}
                  </button>
                </div>
              )}
            </div>

            <div className="sortable-children-field__list">
              {items.map((item, index) => {
                const itemClasses = ['sortable-children-field__item'];
                if (draggedIndex === index) {
                  itemClasses.push('sortable-children-field__item--dragging');
                }

                return (
                  <div
                    key={item[idField]}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={itemClasses.join(' ')}
                  >
                    <div className="sortable-children-field__drag-handle">
                      <svg
                        className="sortable-children-field__drag-icon"
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

                    <div className="sortable-children-field__item-content">
                      <div className="sortable-children-field__item-title">
                        {item[labelField] || 'Untitled'}
                      </div>
                    </div>

                    <div className="sortable-children-field__item-position">
                      #{index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {hasChanges && (
            <div className="sortable-children-field__warning">
              <div className="sortable-children-field__warning-text">
                You have unsaved changes. Click "Save Order" to update positions.
              </div>
            </div>
          )}
        </>
      )}

      {fieldError && (
        <p className="sortable-children-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

const SortableChildrenFieldTypeDisplay = ({ value, config }) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return <span className="sortable-children-field__display sortable-children-field__display--empty">-</span>;
  }

  return (
    <span className="sortable-children-field__display">
      {value.length} {value.length === 1 ? 'item' : 'items'}
    </span>
  );
};

export const sortableChildrenFieldType = {
  type: 'sortable-children',
  Input: SortableChildrenFieldTypeInput,
  Display: SortableChildrenFieldTypeDisplay,
  defaultConfig: {
    sortable_children: {},
    labelField: 'title',
    positionField: 'position',
    idField: 'id',
  },
};

export const useSortableChildrenField = (config) => {
  return useMemo(() => ({
    Input: (props) => <SortableChildrenFieldTypeInput {...props} config={config} />,
    Display: (props) => <SortableChildrenFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
