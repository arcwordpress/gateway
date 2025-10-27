import { useState, useEffect } from '@wordpress/element';
import { Grid } from '@gateway/grid';
import stateManager from './StateManager';

const App = ({ collectionKey }) => {
  const [externalFilters, setExternalFilters] = useState({});

  // Subscribe to external filter changes
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
      externalFilters={externalFilters}
    />
  );
};

export default App;
