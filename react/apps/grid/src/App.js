import { useState, useEffect } from '@wordpress/element';
import { HashRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Grid, SingleView, Modal } from '@arcwp/gateway-grids';
import stateManager from './StateManager';
import ViewSwitcher from './components/ViewSwitcher';
import { generateRoutes, normalizeViews, navigationHelpers } from './router';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';

console.log('Welcome to React hellscape!')

const GridView = ({ collectionKey, showFilters, externalFilters, enabledViews }) => {
  const { viewType = 'table', recordId } = useParams();
  const navigate = useNavigate();

  // Ensure viewType is valid
  const validViewType = enabledViews && enabledViews.includes(viewType)
    ? viewType
    : (enabledViews && enabledViews[0]) || 'table';

  const handleViewChange = (newViewType) => {
    navigationHelpers.changeView(navigate, newViewType);
  };

  const handleViewRecord = (record) => {
    navigationHelpers.viewRecord(navigate, validViewType, record);
  };

  const handleCloseModal = () => {
    navigationHelpers.closeModal(navigate, validViewType);
  };

  return (
    <>
      <ViewSwitcher
        currentView={validViewType}
        onViewChange={handleViewChange}
        enabledViews={enabledViews}
      />
      <Grid
        collectionKey={collectionKey}
        showActions={false}
        showFilters={showFilters}
        externalFilters={externalFilters}
        viewType={validViewType}
        onView={handleViewRecord}
      >
        {recordId && (
          <Modal isOpen={true} onClose={handleCloseModal}>
            <SingleView recordId={recordId} />
          </Modal>
        )}
      </Grid>
    </>
  );
};

const App = ({ 
  collectionKey, 
  showFilters = true, 
  externalFilters: initialExternalFilters = {},
  enabledViews = ['table', 'board'] // Can be false, true (all), or array of view types
}) => {
  const [externalFilters, setExternalFilters] = useState(initialExternalFilters);

  const normalizedViews = normalizeViews(enabledViews);

  // Subscribe to external filter changes from filters app
  useEffect(() => {
    if (!collectionKey) return;

    const unsubscribe = stateManager.subscribe(collectionKey, ({ type, value }) => {
      if (type === 'filters') {
        setExternalFilters(value);
      }
    });

    return unsubscribe;
  }, [collectionKey]);

  const routes = generateRoutes({
    collectionKey,
    showFilters,
    externalFilters,
    enabledViews: normalizedViews,
    GridView,
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
