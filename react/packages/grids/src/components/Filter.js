import SelectFilter from './filter-types/select/SelectFilter';
import TextFilter from './filter-types/text/TextFilter';
import RangeFilter from './filter-types/range/RangeFilter';
import DateRangeFilter from './filter-types/date_range/DateRangeFilter';

/**
 * Filter Component
 * Generic filter component that renders the appropriate filter type based on config
 *
 * @param {Object} props
 * @param {Object} props.filter - Filter configuration object
 * @param {string} props.filter.type - Filter type ('select', 'text', 'range', 'date_range')
 * @param {string} props.filter.label - Filter label
 * @param {string} props.filter.field - Field name to filter on
 * @param {Array} props.filter.choices - Options for select filter
 * @param {number} props.filter.min - Min value for range filter
 * @param {number} props.filter.max - Max value for range filter
 * @param {*} props.value - Current filter value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 */
const Filter = ({ filter, value, onChange, className = '' }) => {
  if (!filter || !filter.type) {
    console.warn('Filter component requires a filter config with a type property');
    return null;
  }

  const { type, label, choices, placeholder, min, max, field } = filter;

  switch (type) {
    case 'select':
      return (
        <SelectFilter
          label={label}
          choices={choices || []}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || 'Select...'}
          className={className}
        />
      );

    case 'text':
      return (
        <TextFilter
          label={label}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || 'Search...'}
          className={className}
        />
      );

    case 'range':
      return (
        <RangeFilter
          label={label}
          value={value || { min: '', max: '' }}
          onChange={onChange}
          min={min}
          max={max}
          minPlaceholder={placeholder?.min || 'Min'}
          maxPlaceholder={placeholder?.max || 'Max'}
          className={className}
        />
      );

    case 'date_range':
      return (
        <DateRangeFilter
          label={label}
          value={value || { start: '', end: '' }}
          onChange={onChange}
          startPlaceholder={placeholder?.start || 'Start Date'}
          endPlaceholder={placeholder?.end || 'End Date'}
          className={className}
        />
      );

    default:
      console.warn(`Unknown filter type: ${type}`);
      return null;
  }
};

export default Filter;
