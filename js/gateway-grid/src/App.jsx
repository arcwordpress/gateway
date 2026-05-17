import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Toolbar        from './Toolbar';
import Grid           from './Grid';
import ListView       from './ListView';
import CardsView      from './CardsView';
import Facets         from './Facets';
import FallbackFacets from './FallbackFacets';
import Footer         from './Footer';
import RecordModal    from './RecordModal';
import CreateModal    from './CreateModal';
import SkeletonLoader from './SkeletonLoader';
import { getSortableFields, resolveRecordLink } from './utils';

const App = ({ collectionKey, apiRoot, showFilters, showFacetToggle, perPage: initialPerPage, colorScheme, defaultView, enabledViews, hiddenFields = [], recordViewMode = 'modal', recordLinkPattern = '', actionsEnabled = false, actionRoles = ['administrator'], createActionEnabled = false, createActionRoles = ['administrator'] }) => {
  const [collection,  setCollection]  = useState(null);
  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetching,    setFetching]    = useState(false);
  const [error,       setError]       = useState(null);
  const [facetValues, setFacetValues] = useState({});
  const [perPage,     setPerPage]     = useState(initialPerPage);
  const [page,       setPage]       = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = perPage > 0 ? Math.max(1, Math.ceil(totalCount / perPage)) : 1;
  const [showFacets,  setShowFacets]  = useState(true);
  const [search,      setSearch]      = useState('');
  const [view,        setView]        = useState(defaultView || 'table');
  const [sortField,      setSortField]      = useState('');
  const [sortDir,        setSortDir]        = useState('asc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [refreshToken,   setRefreshToken]   = useState(0);

  useEffect(() => {
    if (!collectionKey) return;

    const load = async () => {
      // Initial load shows full loader; page/size changes just dim the records
      if (records.length === 0) setLoading(true);
      else setFetching(true);
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
        if (perPage > 0) {
          url.searchParams.set('per_page', String(perPage));
          url.searchParams.set('page', String(page));
        }
        if (sortField) {
          url.searchParams.set('order_by', sortField);
          url.searchParams.set('order', sortDir);
        }

        const recRes = await fetch(url.toString());
        if (!recRes.ok) throw new Error(`Failed to fetch records`);
        const data = await recRes.json();

        const rows = Array.isArray(data)             ? data
          : Array.isArray(data?.data?.items)         ? data.data.items
          : Array.isArray(data?.data)                ? data.data
          : Array.isArray(data?.items)               ? data.items
          : [];
        setRecords(rows);

        // Gateway API wraps pagination in data.data.pagination
        const pagination  = data?.data?.pagination ?? {};
        const headerTotal = parseInt(recRes.headers.get('X-WP-Total') || '0', 10);
        const bodyTotal   = pagination.record_count ?? data?.total ?? data?.meta?.total ?? data?.count ?? null;

        const resolvedTotal = headerTotal || (typeof bodyTotal === 'number' ? bodyTotal : rows.length);
        setTotalCount(resolvedTotal);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setFetching(false);
      }
    };

    load();
  }, [collectionKey, apiRoot, perPage, page, sortField, sortDir, refreshToken]);

  const handlePerPageChange = (n) => {
    setPerPage(n);
    setPage(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSortFieldChange = (field) => {
    setSortField(field);
    setSortDir('asc');
    setPage(1);
  };

  const handleSortDirToggle = () => {
    setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  if (loading) {
    const loadingClass = `gty-grid${colorScheme === 'dark' ? ' gty-grid--dark' : ''}`;
    return <div class={loadingClass}><SkeletonLoader /></div>;
  }
  if (error)   return <div class="gty-grid"><div class="gty-grid__error">Error: {error}</div></div>;
  if (!collection) return null;

  const currentUserRoles = Array.isArray(window.gatewayBd?.currentUserRoles)
    ? window.gatewayBd.currentUserRoles : [];
  const canSeeActions = actionsEnabled && actionRoles.some(r => currentUserRoles.includes(r));
  const canCreate     = createActionEnabled && createActionRoles.some(r => currentUserRoles.includes(r));

  const onRecordClick  = recordViewMode === 'modal' ? setSelectedRecord : null;
  const getRecordHref  = recordViewMode === 'link' && recordLinkPattern
    ? (record) => resolveRecordLink(recordLinkPattern, record)
    : null;

  const sortFields  = getSortableFields(collection);
  const gridConfig = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};
  const facets     = Array.isArray(gridConfig?.facets) ? gridConfig.facets : [];
  const hasFacets  = facets.length > 0;

  const facetTypeMap = Object.fromEntries(
    facets.map(f => [f.field_name || f.field || f.key, f.facet_type || f.type || 'text'])
  );

  const handleFacetChange = (field, value) => setFacetValues(p => ({ ...p, [field]: value }));

  const filtered = records.filter((record) => {
    if (search) {
      const q = search.toLowerCase();
      const hit = Object.values(record).some(
        v => v !== null && typeof v !== 'object' && String(v).toLowerCase().includes(q)
      );
      if (!hit) return false;
    }

    for (const [field, value] of Object.entries(facetValues)) {
      if (!value && value !== false) continue;

      if (field === 'listingType') {
        const lt = record.listingType;
        if (String(lt?.id ?? lt ?? '') !== String(value)) return false;
        continue;
      }

      const type = facetTypeMap[field] || 'text';
      if (type === 'select' || type === 'checkbox') {
        if (String(record[field] ?? '') !== String(value)) return false;
      } else {
        if (!String(record[field] ?? '').toLowerCase().includes(String(value).toLowerCase())) return false;
      }
    }

    return true;
  });

  const rootClass = `gty-grid${colorScheme === 'dark' ? ' gty-grid--dark' : ''}`;

  return (
    <div class={rootClass}>
      <Toolbar
        filtersEnabled={showFilters}
        facetToggleEnabled={showFacetToggle}
        facetsVisible={showFacets}
        onToggleFacets={() => setShowFacets(v => !v)}
        view={view}
        onViewChange={setView}
        enabledViews={enabledViews}
        search={search}
        onSearchChange={setSearch}
        sortFields={sortFields}
        sortField={sortField}
        sortDir={sortDir}
        onSortFieldChange={handleSortFieldChange}
        onSortDirToggle={handleSortDirToggle}
        canCreate={canCreate}
        onCreateClick={() => setShowCreate(true)}
      />

      {showFilters && showFacets && (
        hasFacets
          ? <Facets facets={facets} values={facetValues} onChange={handleFacetChange} />
          : <FallbackFacets records={records} values={facetValues} onChange={handleFacetChange} />
      )}

      <div class={fetching ? 'gty-records gty-records--fetching' : 'gty-records'}>
        {view === 'cards'
          ? <CardsView collection={collection} records={filtered} onRecordClick={onRecordClick} getRecordHref={getRecordHref} canSeeActions={canSeeActions} />
          : view === 'list'
            ? <ListView collection={collection} records={filtered} onRecordClick={onRecordClick} getRecordHref={getRecordHref} canSeeActions={canSeeActions} />
            : <Grid collection={collection} records={filtered} sortField={sortField} sortDir={sortDir} onSort={handleSort} hiddenFields={hiddenFields} onRecordClick={onRecordClick} getRecordHref={getRecordHref} canSeeActions={canSeeActions} />
        }
      </div>

      {selectedRecord && (
        <RecordModal record={selectedRecord} collection={collection} onClose={() => setSelectedRecord(null)} />
      )}

      {showCreate && (
        <CreateModal
          collection={collection}
          apiRoot={apiRoot}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setPage(1);
            setRefreshToken(t => t + 1);
          }}
        />
      )}

      <Footer
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
};

export default App;
