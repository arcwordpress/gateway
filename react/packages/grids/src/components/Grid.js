import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGridContext } from '../context/GridContext';
import TableView from './view-types/TableView';
import ListView from './view-types/ListView';
import CardsView from './view-types/CardsView';
import GridFilters from './GridFilters';
import FilterIcon from './FilterIcon';
import { GridProvider } from '../context/GridContext';
import { collectionApi } from '@arcwp/gateway-data';
import { generateColumns } from '../services/columnGenerator';
import { applyFilters } from '../utils/filterUtils';
import SingleView from './SingleView';
import DeleteConfirmModal from './DeleteConfirmModal';
import ViewSwitcher from './ViewSwitcher';

/**
 * Main Grid Component
 * Displays a data grid for a Gateway collection
 */
/**
 * @param {object} props
 * @param {string} props.collectionKey
 * @param {Array} [props.viewColumns] - Column definitions from the View object (overrides auto-generation)
 * @param {function} [props.onEdit]
 * @param {function} [props.onDelete]
 * @param {function} [props.onView]
 * @param {object} [props.selectedRecord]
 * @param {function} [props.onCloseView]
 * @param {boolean} [props.showActions]
 * @param {boolean} [props.showFilters]
 * @param {object} [props.externalFilters]
 * @param {string} [props.viewType]
 *@param {React.ComponentType} [props.singleViewComponent] - Custom component for single record view
 * @param {string} [props.title] - Title to display in the grid toolbar
 * @param {React.ReactNode} [props.toolbarActions] - Custom toolbar actions (e.g., create button)
 * @param {boolean} [props.showSearch] - Whether to show the search input (default true)
 * @param {React.ReactNode} [props.children]
 */
const Grid = ({
  collectionKey,
  viewColumns = null,
  onEdit,
  onDelete,
  onView,
  selectedRecord,
  onCloseView,
  showActions = true,
  showFilters = true,
  showSearch = true,
  viewType = 'table',
  singleViewComponent = SingleView,
  title = '',
  toolbarActions = null,
  children,
}) => {
  const { auth } = useGridContext();
  const [collection, setCollection] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [currentView, setCurrentView] = useState(viewType);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Combined effect to load collection and data
  const loadAll = async () => {
    if (!collectionKey) {
      setError('No collection key provided');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch collection metadata
      const collectionData = await collectionApi.fetchCollection(collectionKey, { auth });
      setCollection(collectionData);

      // Fetch collection records
      const namespace = collectionData.routes.namespace;
      const route = collectionData.routes.route;
      const records = await collectionApi.fetchRecords(namespace, route, {}, { auth });
      
      setData(records.data.items);
      setError(null);

    } catch (err) {
      setError(`Failed to load collection or data: ${err.message}`);
      console.error('Error loading collection or data:', err);
      setCollection(null);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionKey]);

  // Update currentView when viewType prop changes
  useEffect(() => {
    setCurrentView(viewType);
  }, [viewType]);

  // Get filters from collection metadata
  const filters = useMemo(() => {
    return collection?.filters || [];
  }, [collection]);

  // Unified filtering logic
  const filteredData = useMemo(() => {
    let result = applyFilters(data, filters, filterValues);
    if (searchText.trim()) {
      const lower = searchText.trim().toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(
          val =>
            typeof val === 'string' &&
            val.toLowerCase().includes(lower)
        )
      );
    }
    return result;
  }, [data, filters, filterValues, searchText]);

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

      await collectionApi.deleteRecord(namespace, route, deleteConfirm.id, { auth });

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

  // Generate columns: use view-defined columns if provided, otherwise auto-generate from collection
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    // viewColumns are [{field, label, sortable}] — same shape as collection.grid.columns
    const source = viewColumns
      ? { ...collection, grid: { columns: viewColumns } }
      : collection;
    const baseColumns = generateColumns(source);

    if (showActions && (onEdit || onDelete || onView)) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const recordId = row.original.id;
          return (
            <div className="grid__actions">
              {onView && (
                <button
                  onClick={() => onView(row.original)}
                  className="grid__btn grid__btn--view"
                >
                  View
                </button>
              )}
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
  }, [data, collection, viewColumns, showActions, onEdit, onDelete, onView]);

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
    onRefresh: loadAll,
    auth,
  }), [collection, data, auth, collectionKey]);

  if (error) {
    return (
      <div className="grid__error">
        <h3 className="grid__error-title">Error</h3>
        <p className="grid__error-message">{error}</p>
      </div>
    );
  }

  if (loading && !collection) {
    const skeletonWidths = [55, 30, 20, 15];
    return (
      <div className="grid">
        <div className="grid__toolbar-row">
          <div className="grid__toolbar-end">
            <div className="grid__skeleton-bar" style={{ width: 26, height: 26, borderRadius: '0.25rem' }} />
            <div className="grid__skeleton-bar" style={{ width: 26, height: 26, borderRadius: '0.25rem' }} />
            <div className="grid__skeleton-bar" style={{ width: 160, height: 26, borderRadius: 0 }} />
          </div>
        </div>
        <table className="grid__skeleton-table">
          <thead>
            <tr className="grid__skeleton-row">
              {skeletonWidths.map((w, i) => (
                <th key={i} className="grid__skeleton-th">
                  <div className="grid__skeleton-bar" style={{ width: `${w}%` }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, i) => (
              <tr key={i} className="grid__skeleton-row">
                {skeletonWidths.map((w, j) => (
                  <td key={j} className="grid__skeleton-cell">
                    <div className="grid__skeleton-bar" style={{ width: `${w}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <GridProvider value={gridContextValue}>
      <div className="grid">

        <div className="grid__toolbar-row">

          {toolbarActions && (
            <div className="grid__toolbar-left">
              {toolbarActions}
            </div>
          )}

          <div className="grid__toolbar-end">
            {showFilters && filters.length > 0 && (
              <FilterIcon
                onClick={() => setFiltersOpen(v => !v)}
                isOpen={filtersOpen}
              />
            )}
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              enabledViews={['table', 'list', 'cards']}
            />
            {showSearch && (
              <input
                type="search"
                className="grid__search-input"
                placeholder="Search…"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            )}
          </div>

        </div>

        {showFilters && filters.length > 0 && (
          <GridFilters
            filters={filters}
            values={filterValues}
            onChange={setFilterValues}
            data={data}
            isOpen={filtersOpen}
          />
        )}

        {/* Use currentView for selecting the view component */}
        {(() => {
          let ViewComponent;
          let viewProps;
          switch (currentView) {
            case 'list':
              ViewComponent = ListView;
              viewProps = { onView, selectedRecord, onCloseView, singleViewComponent };
              break;
            case 'cards':
              ViewComponent = CardsView;
              viewProps = { onView, selectedRecord, onCloseView, singleViewComponent };
              break;
            case 'table':
            default:
              ViewComponent = TableView;
              viewProps = {
                columns,
              };
              break;
          }
          return (
            <ViewComponent
              data={filteredData}
              loading={loading}
              {...viewProps}
            />
          );
        })()}

        {deleteConfirm && (
          <DeleteConfirmModal
            open={!!deleteConfirm}
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            loading={deleteConfirm.loading}
          />
        )}
      </div>
      {children}
    </GridProvider>
  );
};

export default Grid;
