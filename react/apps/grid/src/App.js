import { useState, useEffect } from '@wordpress/element';
import { HashRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Grid } from '@arcwp/gateway-grids';
import stateManager from './StateManager';
import ViewSwitcher from './components/ViewSwitcher';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';

const GridView = ({ collectionKey, showFilters, externalFilters, enabledViews }) => {
  const { viewType = 'table' } = useParams();
  const navigate = useNavigate();

  // Ensure viewType is valid
  const validViewType = enabledViews && enabledViews.includes(viewType)
    ? viewType
    : (enabledViews && enabledViews[0]) || 'table';

  const handleViewChange = (newViewType) => {
    navigate(`/${newViewType}`);
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
      />
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

  // Normalize enabledViews
  const normalizedViews = enabledViews === true
    ? ['table', 'board', 'calendar', 'gallery']
    : enabledViews === false
    ? ['table']
    : Array.isArray(enabledViews)
    ? enabledViews
    : ['table', 'board'];

  // Subscribe to external filter changes from filters app (if using separate filters block)
  useEffect(() => {
    if (!collectionKey) return;

    const unsubscribe = stateManager.subscribe(collectionKey, ({ type, value }) => {
      if (type === 'filters') {
        setExternalFilters(value);
      }
    });

    return unsubscribe;
  }, [collectionKey]);

  return (
    <Router>
      <Routes>
        <Route
          path="/:viewType"
          element={
            <GridView
              collectionKey={collectionKey}
              showFilters={showFilters}
              externalFilters={externalFilters}
              enabledViews={normalizedViews}
            />
          }
        />
        <Route path="/" element={<Navigate to={`/${normalizedViews[0]}`} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
