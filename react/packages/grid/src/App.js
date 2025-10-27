import { useState, useEffect, useMemo } from '@wordpress/element';
import DataTable from './components/DataTable';
import { fetchCollection, fetchCollectionData, deleteRecord } from './services/collectionService';

/**
 * Main Grid App Component
 * Displays a data grid for a Gateway collection
 */
const App = ({ collectionKey, onEdit, onDelete, showActions = true }) => {
  const [collection, setCollection] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, loading }

  // Fetch collection metadata
  useEffect(() => {
    if (!collectionKey) {
      setError('No collection key provided');
      setLoading(false);
      return;
    }

    const loadCollection = async () => {
      try {
        setLoading(true);
        const collectionData = await fetchCollection(collectionKey);
        setCollection(collectionData);
        setError(null);
      } catch (err) {
        setError(`Failed to load collection: ${err.message}`);
        console.error('Error loading collection:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionKey]);

  // Fetch collection data (records)
  useEffect(() => {
    if (!collection) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const namespace = collection.routes.namespace;
        const route = collection.routes.route;

        const result = await fetchCollectionData(namespace, route);

        // Handle different response formats
        // If response has a 'data' property, use that; otherwise use the response itself
        const records = result.data || result;
        setData(Array.isArray(records) ? records : []);
        setError(null);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error('Error loading data:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collection]);

  // Get filters from collection metadata - MUST be before any early returns
  const filters = useMemo(() => {
    return collection?.filters || [];
  }, [collection]);

  // Handle delete with confirmation
  const handleDeleteClick = (recordId) => {
    setDeleteConfirm({ id: recordId, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !collection) return;

    setDeleteConfirm({ ...deleteConfirm, loading: true });

    try {
      const namespace = collection.routes.namespace;
      const route = collection.routes.route;

      await deleteRecord(namespace, route, deleteConfirm.id);

      // Remove the deleted record from the data
      setData((prevData) => prevData.filter((record) => record.id !== deleteConfirm.id));

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(deleteConfirm.id);
      }

      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting record:', err);
      alert(`Failed to delete record: ${err.message}`);
      setDeleteConfirm({ ...deleteConfirm, loading: false });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // Generate columns from collection fields or data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    let baseColumns = [];

    // If collection has fields defined, use those
    if (collection?.fields && Object.keys(collection.fields).length > 0) {
      baseColumns = Object.entries(collection.fields).map(([key, field]) => ({
        accessorKey: key,
        header: field.label || key,
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ getValue }) => {
          const value = getValue();
          // Handle null/undefined values
          if (value === null || value === undefined) return '-';
          // Handle objects and arrays
          if (typeof value === 'object') return JSON.stringify(value);

          const stringValue = String(value);

          // For textarea, markdown, and other long text field types, show with tooltip
          const isLongTextField = ['textarea', 'markdown', 'wysiwyg'].includes(field.type) ||
                                  ['description', 'content', 'body', 'text', 'message', 'notes'].includes(key.toLowerCase());

          if (isLongTextField && stringValue.length > 100) {
            return (
              <span title={stringValue} className="cursor-help">
                {stringValue}
              </span>
            );
          }

          return stringValue;
        },
      }));
    } else {
      // Otherwise, generate columns from the first data record
      const firstRecord = data[0];
      if (!firstRecord) return [];

      baseColumns = Object.keys(firstRecord).map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ getValue }) => {
          const value = getValue();
          // Handle null/undefined values
          if (value === null || value === undefined) return '-';
          // Handle objects and arrays
          if (typeof value === 'object') return JSON.stringify(value);
          // Handle dates
          if (key.includes('_at') && typeof value === 'string') {
            try {
              return new Date(value).toLocaleString();
            } catch {
              return value;
            }
          }
          // Convert to string
          const stringValue = String(value);

          // For long text fields (description, content, etc.), show truncated version with title
          const isLongTextField = ['description', 'content', 'body', 'text', 'message', 'notes'].includes(key.toLowerCase());
          if (isLongTextField && stringValue.length > 100) {
            return (
              <span title={stringValue} className="cursor-help">
                {stringValue}
              </span>
            );
          }

          return stringValue;
        },
      }));
    }

    // Add actions column if enabled
    if (showActions && (onEdit || onDelete)) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const recordId = row.original.id;
          return (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(recordId)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(recordId)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [data, collection, showActions, onEdit, onDelete]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (loading && !collection) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading collection...</div>
      </div>
    );
  }

  return (
    <div className="gateway-grid-app p-6 bg-white rounded-lg shadow-sm">
      <DataTable data={data} columns={columns} filters={filters} loading={loading} />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteConfirm.loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirm.loading}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteConfirm.loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
