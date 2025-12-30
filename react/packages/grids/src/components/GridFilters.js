import { useMemo } from '@wordpress/element';
import Filters from './Filters';
import Filter from './Filter';
import { extractUniqueValues } from '../utils/filterUtils';

/**
 * GridFilters Component
 * Renders a collection of filters based on collection metadata
 */
const GridFilters = ({ filters, values, onChange, data, isOpen }) => {
  const processedFilters = useMemo(() => {
    return filters.map(filter => {
      if (filter.type === 'select' && !filter.choices) {
        return {
          ...filter,
          choices: extractUniqueValues(data, filter.field)
        };
      }
      return filter;
    });
  }, [filters, data]);

  if (!isOpen) return null;

  return (
    <div className="gty-grid__filters">
      <div className="gty-grid__filters-container">
        <Filters direction="row">
          {processedFilters.map(filter => (
            <Filter
              key={filter.field}
              filter={filter}
              value={values[filter.field]}
              onChange={value =>
                onChange(prev => ({
                  ...prev,
                  [filter.field]: value
                }))
              }
            />
          ))}
        </Filters>
      </div>
    </div>
  );
};

export default GridFilters;