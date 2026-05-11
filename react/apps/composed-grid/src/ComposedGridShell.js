import { useState, useMemo, useEffect } from '@wordpress/element';
import GridLayout from '../../../packages/grids/src/components/GridLayout';
import { GridProvider, useGridContext } from '../../../packages/grids/src/context/GridContext';
import { generateColumns } from '../../../packages/grids/src/services/columnGenerator';
import { collectionApi } from '../../../packages/data/src';
import '../../../packages/grids/src/style.css';

/**
 * Inner component — sits inside the GridProvider so it can call useGridContext.
 * Demonstrates how to render a custom header, then GridLayout.Pagination and
 * GridLayout.Facets separately, while the table lives in a narrow centre column.
 */
const ComposedGridInner = ({ filters, filterValues, setFilterValues, rawData, columns }) => {
  const { collection } = useGridContext();

  return (
    <div className="composed-grid">
      {/* ── custom header ─────────────────────────────── */}
      <div className="composed-grid__header">
        <h2 className="composed-grid__title">
          {collection?.title || collection?.label || 'Collection'}
        </h2>
        <p className="composed-grid__subtitle">
          Rendered with <code>GridLayout</code> compound exports
        </p>
      </div>

      {/* ── facets (filters) above the table ─────────── */}
      {filters.length > 0 && (
        <GridLayout.Facets
          filters={filters}
          values={filterValues}
          onChange={setFilterValues}
          data={rawData}
          isOpen={true}
        />
      )}

      {/* ── default table view ────────────────────────── */}
      <GridLayout.TableView
        data={rawData}
        columns={columns}
        loading={false}
      />
    </div>
  );
};

/**
 * Outer component — owns fetch state and manually builds the GridProvider value,
 * demonstrating the headless path.
 */
const ComposedGridShell = ({ collectionKey, auth = null }) => {
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    if (!collectionKey) return;

    setLoading(true);
    collectionApi
      .fetchCollection(collectionKey, { auth })
      .then(async (col) => {
        setCollection(col);
        const ns    = col.routes.namespace;
        const route = col.routes.route;
        const res   = await collectionApi.fetchRecords(ns, route, {}, { auth });
        setRecords(res?.data?.items ?? res?.items ?? res ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [collectionKey]);

  const filters = useMemo(() => collection?.filters ?? [], [collection]);
  const columns = useMemo(() => (collection ? generateColumns(collection) : []), [collection]);

  const ctxValue = useMemo(
    () => ({
      namespace:     collection?.routes?.namespace ?? null,
      route:         collection?.routes?.route ?? null,
      collection,
      records,
      getRecordById: (id) => records.find((r) => r.id == id) ?? null,
      onRefresh:     () => {},
      auth,
    }),
    [collection, records, auth],
  );

  if (error) {
    return (
      <div className="composed-grid__error">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (loading) {
    return <div className="composed-grid__loading">Loading…</div>;
  }

  return (
    <GridProvider value={ctxValue}>
      <ComposedGridInner
        filters={filters}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
        rawData={records}
        columns={columns}
      />
    </GridProvider>
  );
};

export default ComposedGridShell;
