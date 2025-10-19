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
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value.min}
          onChange={handleMinChange}
          placeholder={minPlaceholder}
          min={min}
          max={max}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-24"
        />
        <span className="text-gray-500 text-sm">to</span>
        <input
          type="number"
          value={value.max}
          onChange={handleMaxChange}
          placeholder={maxPlaceholder}
          min={min}
          max={max}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-24"
        />
      </div>
    </div>
  );
};

export default RangeFilter;
