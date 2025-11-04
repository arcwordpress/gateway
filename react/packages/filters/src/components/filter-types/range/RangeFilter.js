import './style.css';

/**
 * RangeFilter Component
 * Min/max numeric range filter
 *
 * @param {Object} props
 * @param {Object} props.value - Current filter value {min: number, max: number}
 * @param {Function} props.onChange - Change handler receives {min, max}
 * @param {string} props.label - Label text for the range
 * @param {number} props.min - Minimum allowed value
 * @param {number} props.max - Maximum allowed value
 * @param {string} props.minPlaceholder - Placeholder for min input
 * @param {string} props.maxPlaceholder - Placeholder for max input
 * @param {string} props.className - Additional CSS classes
 */
const RangeFilter = ({
  value = { min: '', max: '' },
  onChange,
  label = '',
  min,
  max,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  className = '',
}) => {
  const handleMinChange = (e) => {
    const newMin = e.target.value;
    if (onChange) {
      onChange({ min: newMin, max: value.max });
    }
  };

  const handleMaxChange = (e) => {
    const newMax = e.target.value;
    if (onChange) {
      onChange({ min: value.min, max: newMax });
    }
  };

  return (
    <div className={['range-filter', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="range-filter__label">
          {label}
        </label>
      )}
      <div className="range-filter__inputs">
        <input
          type="number"
          value={value.min}
          onChange={handleMinChange}
          placeholder={minPlaceholder}
          min={min}
          max={max}
          className="range-filter__input"
        />
        <span className="range-filter__separator">to</span>
        <input
          type="number"
          value={value.max}
          onChange={handleMaxChange}
          placeholder={maxPlaceholder}
          min={min}
          max={max}
          className="range-filter__input"
        />
      </div>
    </div>
  );
};

export default RangeFilter;
