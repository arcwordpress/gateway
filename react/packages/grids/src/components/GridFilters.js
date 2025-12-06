import { useMemo, useState } from '@wordpress/element';
import Filters from './Filters';
import Filter from './Filter';
import { extractUniqueValues } from '../utils/filterUtils';

/**
 * GridFilters Component
 * Renders a collection of filters based on collection metadata
 */
const MinimizeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14H10V20" stroke="#9CA2A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 10H14V4" stroke="#9CA2A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 10L21 3" stroke="#9CA2A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 21L10 14" stroke="#9CA2A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GridFilters = ({ filters, values, onChange, data }) => {
  const [open, setOpen] = useState(true);

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

  return (
    <div className="gty-grid__filters">
      <div
        className="gty-grid__filters-header"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em', cursor: 'pointer' }}
        onClick={() => setOpen(v => !v)}
        tabIndex={0}
        role="button"
        aria-expanded={open}
      >
        <MinimizeIcon />
        <span className="gty-grid__filters-title">Filters</span>
      </div>
      {open && (
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
      )}
    </div>
  );
};

export default GridFilters;