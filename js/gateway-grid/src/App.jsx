import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Grid from './Grid';
import Facets from './Facets';

const App = ({ collectionKey, apiRoot, showFilters, perPage }) => {
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facetValues, setFacetValues] = useState({});

  useEffect(() => {
    if (!collectionKey) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch collection metadata
        const metaRes = await fetch(`${apiRoot}gateway/v1/collections/${collectionKey}`);
        if (!metaRes.ok) throw new Error(`Collection not found: ${collectionKey}`);
        const meta = await metaRes.json();
        setCollection(meta);

        // 2. Resolve the get_many route from the routes array in the collection metadata
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
        setRecords(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [collectionKey, apiRoot, perPage]);

  const handleFacetChange = (field, value) => {
    setFacetValues((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div class="gbd-grid__loading">Loading…</div>;
  }

  if (error) {
    return <div class="gbd-grid__error">Error: {error}</div>;
  }

  if (!collection) return null;

  const facets = collection?.grid?.facets || [];
  const hasFacets = showFilters && facets.length > 0;

  // Client-side facet filtering
  const filtered = records.filter((record) => {
    for (const [field, value] of Object.entries(facetValues)) {
      if (!value) continue;
      const recordVal = String(record[field] ?? '');
      if (!recordVal.toLowerCase().includes(String(value).toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div class="gbd-grid">
      {hasFacets && (
        <Facets
          facets={facets}
          values={facetValues}
          onChange={handleFacetChange}
        />
      )}
      <Grid collection={collection} records={filtered} />
    </div>
  );
};

export default App;
