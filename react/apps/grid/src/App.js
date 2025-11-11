import { useState, useEffect } from '@wordpress/element';
import { HashRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Grid, SingleView } from '@arcwp/gateway-grids';
import stateManager from './StateManager';
import ViewSwitcher from './components/ViewSwitcher';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';

const SingleRecordView = ({ collectionKey, viewType, enabledViews }) => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch single record data
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        // This would use collectionService to fetch a single record
        // For now, we'll rely on passing the record through navigation state
        const navState = window.history.state?.usr;
        if (navState?.record) {
          setRecord(navState.record);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching record:', error);
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId, collectionKey]);

  const handleBack = () => {
    navigate(`/${viewType}`);
  };

  if (loading) {
    return <div className="grid__loading">Loading record...</div>;
  }

  return (
    <div className="single-record-view">
      <div className="single-record-view__header">
        <button onClick={handleBack} className="grid__btn grid__btn--back">
          ← Back to {viewType}
        </button>
      </div>
      <SingleView record={record} />
    </div>
  );
};

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

  const handleViewRecord = (record) => {
    navigate(`/${validViewType}/${record.id}`, { state: { record } });
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
          path="/:viewType/:recordId"
          element={
            <SingleRecordView
              collectionKey={collectionKey}
              viewType={normalizedViews[0]}
              enabledViews={normalizedViews}
            />
          }
        />
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
