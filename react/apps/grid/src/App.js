import { useState, useEffect } from '@wordpress/element';
import { Grid } from '@arcwp/gateway-grid';
import stateManager from './StateManager';

const App = ({ collectionKey, showFilters = true, externalFilters: initialExternalFilters = {} }) => {
  const [externalFilters, setExternalFilters] = useState(initialExternalFilters);

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
    <Grid
      collectionKey={collectionKey}
      showActions={false}
      showFilters={showFilters}
      externalFilters={externalFilters}
    />
  );
};

export default App;
