import { useState, useEffect } from '@wordpress/element';
import { HashRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Grid, SingleView, Modal } from '@arcwp/gateway-grids';
import { viewApi } from '@arcwp/gateway-data';
import stateManager from './StateManager';
import { generateRoutes, normalizeViews, navigationHelpers } from './router';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';

const ViewGrid = ({ collectionKey, viewColumns, showFilters, enabledViews }) => {
  const { viewType = 'table', recordId } = useParams();
  const navigate = useNavigate();

  const validViewType = enabledViews && enabledViews.includes(viewType)
    ? viewType
    : (enabledViews && enabledViews[0]) || 'table';

  const handleViewRecord = (record) => {
    navigationHelpers.viewRecord(navigate, validViewType, record);
  };

  const handleCloseModal = () => {
    navigationHelpers.closeModal(navigate, validViewType);
  };

  return (
    <Grid
      collectionKey={collectionKey}
      viewColumns={viewColumns}
      showActions={false}
      showFilters={showFilters}
      viewType={validViewType}
      onView={handleViewRecord}
      enabledViews={enabledViews}
    >
      {recordId && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <SingleView recordId={recordId} />
        </Modal>
      )}
    </Grid>
  );
};

const App = ({ viewKey, showFilters = true }) => {
  const [view, setView] = useState(null);
  const [error, setError] = useState(null);
  const [externalFilters, setExternalFilters] = useState({});

  // Fetch view metadata (columns, collection key, etc.)
  useEffect(() => {
    if (!viewKey) return;
    viewApi.fetchView(viewKey)
      .then(setView)
      .catch((err) => {
        console.error('[Gateway View] Failed to load view:', err);
        setError(err.message);
      });
  }, [viewKey]);

  // Subscribe to cross-component filter updates keyed by viewKey
  useEffect(() => {
    if (!viewKey) return;
    const unsubscribe = stateManager.subscribe(viewKey, ({ type, value }) => {
      if (type === 'filters') {
        setExternalFilters(value);
      }
    });
    return unsubscribe;
  }, [viewKey]);

  if (error) {
    return <div className="gateway-view__error">View error: {error}</div>;
  }

  if (!view) {
    return <div className="gateway-view__loading">Loading view…</div>;
  }

  const collectionKey = view.collection;
  const viewColumns = view.columns && view.columns.length > 0 ? view.columns : null;
  const enabledViews = normalizeViews(['table', 'board']);

  const routes = generateRoutes({
    viewKey,
    collectionKey,
    viewColumns,
    showFilters,
    externalFilters,
    enabledViews,
    ViewGrid,
  });

  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
};

export default App;
