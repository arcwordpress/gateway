import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Grid from './Grid';
import Facets from './Facets';
import Footer from './Footer';

const App = ({ collectionKey, apiRoot, showFilters, perPage: initialPerPage, colorScheme }) => {
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facetValues, setFacetValues] = useState({});
  const [perPage, setPerPage] = useState(initialPerPage);

  useEffect(() => {
    if (!collectionKey) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const metaRes = await fetch(`${apiRoot}gateway/v1/collections/${collectionKey}`);
        if (!metaRes.ok) throw new Error(`Collection not found: ${collectionKey}`);
        const meta = await metaRes.json();
        setCollection(meta);

        const getManyRoute = Array.isArray(meta.routes)
          ? meta.routes.find(r => r.type === 'get_many')
          : null;

        if (!getManyRoute) throw new Error(`No get_many route found for collection: ${collectionKey}`);

        const url = new URL(`${apiRoot}${getManyRoute.route}`, window.location.origin);
        url.searchParams.set('relations', 'true');
        url.searchParams.set('per_page', String(perPage));

        const recRes = await fetch(url.toString());
        if (!recRes.ok) throw new Error(`Failed to fetch records`);
        const data = await recRes.json();
        const rows = Array.isArray(data)              ? data
          : Array.isArray(data?.data?.items)          ? data.data.items
          : Array.isArray(data?.data)                 ? data.data
          : Array.isArray(data?.items)                ? data.items
          : [];
        setRecords(rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [collectionKey, apiRoot, perPage]);

  if (loading) {
    return <div class="gbd-grid"><div class="gbd-grid__loading">Loading…</div></div>;
  }

  if (error) {
    return <div class="gbd-grid"><div class="gbd-grid__error">Error: {error}</div></div>;
  }

  if (!collection) return null;

  const gridConfig = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};
  const facets = Array.isArray(gridConfig?.facets) ? gridConfig.facets : [];
  const hasFacets = showFilters && facets.length > 0;

  const filtered = records.filter((record) => {
    for (const [field, value] of Object.entries(facetValues)) {
      if (!value) continue;
      if (!String(record[field] ?? '').toLowerCase().includes(String(value).toLowerCase())) return false;
    }
    return true;
  });

  const rootClass = `gbd-grid${colorScheme === 'dark' ? ' gbd-grid--dark' : ''}`;

  return (
    <div class={rootClass}>
      {hasFacets && (
        <Facets facets={facets} values={facetValues} onChange={(f, v) => setFacetValues(p => ({ ...p, [f]: v }))} />
      )}

      <Grid collection={collection} records={filtered} />

      <Footer totalRows={filtered.length} perPage={perPage} onPerPageChange={setPerPage} />
    </div>
  );
};

export default App;
