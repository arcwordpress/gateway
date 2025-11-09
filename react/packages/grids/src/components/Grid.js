import { useState, useEffect, useMemo } from '@wordpress/element';
import TableView from './view-types/TableView';
import BoardView from './view-types/BoardView';
import { fetchCollection, fetchCollectionData, deleteRecord } from '../services/collectionService';
import { generateColumns } from '../services/columnGenerator';

/**
 * Main Grid Component
 * Displays a data grid for a Gateway collection
 */
const Grid = ({
  collectionKey,
  onEdit,
  onDelete,
  showActions = true,
  showFilters = true,
  externalFilters = {},
  viewType = 'table', // 'table' | 'board'
  boardConfig = {},
}) => {
  const [collection, setCollection] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, loading }
  const [filterValues, setFilterValues] = useState({});

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

  // Unified filtering logic (moved from DataTable)
  const filteredData = useMemo(() => {
    return applyFilters(data, filters, filterValues);
  }, [data, filters, filterValues]);

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

  // Generate columns from collection configuration
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get base columns from collection metadata
    const baseColumns = generateColumns(collection);

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
            <div className="grid__actions">
              {onEdit && (
                <button
                  onClick={() => onEdit(recordId)}
                  className="grid__btn grid__btn--edit"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(recordId)}
                  className="grid__btn grid__btn--delete"
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

  // View component selection
  const ViewComponent = viewType === 'board' ? BoardView : TableView;
  const viewProps = viewType === 'board' 
    ? { config: boardConfig }
    : { columns };

  if (error) {
    return (
      <div className="grid__error">
        <h3 className="grid__error-title">Error</h3>
        <p className="grid__error-message">{error}</p>
      </div>
    );
  }

  if (loading && !collection) {
    return (
      <div className="grid__loading">
        <div className="grid__loading-message">Loading collection...</div>
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Filters - shared by all views */}
      {showFilters && filters.length > 0 && (
        <GridFilters
          filters={filters}
          values={filterValues}
          onChange={setFilterValues}
          data={data} // For dynamic select choices
        />
      )}

      {/* View-specific rendering */}
      <ViewComponent
        data={filteredData}
        loading={loading}
        {...viewProps}
      />

      {/* Delete modal - shared */}
      {deleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

export default Grid;
