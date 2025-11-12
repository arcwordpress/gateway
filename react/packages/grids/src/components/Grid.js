import { useState, useEffect, useMemo } from '@wordpress/element';
import TableView from './view-types/TableView';
import BoardView from './view-types/BoardView';
import GridFilters from './GridFilters';
import { GridProvider } from '../context/GridContext';
import { fetchCollection, fetchCollectionData, deleteRecord } from '../services/collectionService';
import { generateColumns } from '../services/columnGenerator';
import { applyFilters } from '../utils/filterUtils';

/**
 * Main Grid Component
 * Displays a data grid for a Gateway collection
 */
const Grid = ({
  collectionKey,
  onEdit,
  onDelete,
  onView,
  selectedRecord,
  onCloseView,
  showActions = true,
  showFilters = true,
  externalFilters = {},
  viewType = 'table', // 'table' | 'board'
  boardConfig = {},
  children,
}) => {
  const [collection, setCollection] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
  const fetchData = async () => {
    if (!collection) return;

    try {
      setLoading(true);
      const namespace = collection.routes.namespace;
      const route = collection.routes.route;

      const result = await fetchCollectionData(namespace, route);
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

  useEffect(() => {
    fetchData();
  }, [collection]);

  // Get filters from collection metadata
  const filters = useMemo(() => {
    return collection?.filters || [];
  }, [collection]);

  // Unified filtering logic
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

      setData((prevData) => prevData.filter((record) => record.id !== deleteConfirm.id));

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

    const baseColumns = generateColumns(collection);

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

  // Context value for child components
  const gridContextValue = useMemo(() => ({
    namespace: collection?.routes?.namespace || null,
    route: collection?.routes?.route || null,
    collection,
    records: data,
    getRecordById: (id) => {
      if (!data || data.length === 0) return null;
      // Support both numeric and string IDs
      return data.find(record => record.id == id) || null;
    },
    onRefresh: fetchData,
  }), [collection, data]);

  // View component selection
  const ViewComponent = viewType === 'board' ? BoardView : TableView;
  const viewProps = viewType === 'board' 
    ? { config: boardConfig, onView }
    : { 
        columns,
        onView,
        selectedRecord,
        onCloseView,
      };

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

  if (!collection) {
    return null;
  }

  return (
    <GridProvider value={gridContextValue}>
      <div className="grid">
        {showFilters && filters.length > 0 && (
          <GridFilters
            filters={filters}
            values={filterValues}
            onChange={setFilterValues}
            data={data}
          />
        )}

        <ViewComponent
          data={filteredData}
          loading={loading}
          {...viewProps}
        />

        {deleteConfirm && <DeleteConfirmModal />}
      </div>
      {children}
    </GridProvider>
  );
};

export default Grid;
