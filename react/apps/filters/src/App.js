import { useState, useEffect } from '@wordpress/element';
import { Filters, Filter, fetchCollection } from '@arcwp/gateway-filters';
import stateManager from './StateManager';

/**
 * Filters App Component
 * Renders filters for a Gateway collection
 */
const FiltersApp = ({ collectionKey }) => {
  const [collection, setCollection] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch collection metadata
  useEffect(() => {
    if (!collectionKey) {
      setError('No collection key provided');
      setLoading(false);
      return;
    }

    const loadCollection = async () => {
      try {
        setLoading(true);
        const collectionData = await fetchCollection(collectionKey);
        setCollection(collectionData);
        setError(null);
      } catch (err) {
        setError(`Failed to load collection: ${err.message}`);
        console.error('Error loading collection:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionKey]);

  // Update shared state when filter values change
  useEffect(() => {
    if (collectionKey && Object.keys(filterValues).length > 0) {
      stateManager.updateFilters(collectionKey, filterValues);
    }
  }, [collectionKey, filterValues]);

  const handleFilterChange = (field, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <div className="text-gray-500 text-sm">Loading filters...</div>
      </div>
    );
  }

  const filters = collection?.filters || [];

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="gateway-filters-app p-4 bg-white rounded-lg shadow-sm">
      <Filters direction="row">
        {filters.map((filter) => (
          <Filter
            key={filter.field}
            filter={filter}
            value={filterValues[filter.field] || ''}
            onChange={(value) => handleFilterChange(filter.field, value)}
          />
        ))}
      </Filters>
    </div>
  );
};

export default FiltersApp;
