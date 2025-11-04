/**
 * DateRangeFilter Component
 * Date range filter with start/end date inputs
 *
 * @param {Object} props
 * @param {Object} props.value - Current filter value {start: string, end: string}
 * @param {Function} props.onChange - Change handler receives {start, end}
 * @param {string} props.label - Label text for the date range
 * @param {string} props.startPlaceholder - Placeholder for start date
 * @param {string} props.endPlaceholder - Placeholder for end date
 * @param {string} props.className - Additional CSS classes
 */
const DateRangeFilter = ({
  value = { start: '', end: '' },
  onChange,
  label = '',
  startPlaceholder = 'Start Date',
  endPlaceholder = 'End Date',
  className = '',
}) => {
  const handleStartChange = (e) => {
    const newStart = e.target.value;
    if (onChange) {
      onChange({ start: newStart, end: value.end });
    }
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    if (onChange) {
      onChange({ start: value.start, end: newEnd });
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
          type="date"
          value={value.start}
          onChange={handleStartChange}
          placeholder={startPlaceholder}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <span className="text-gray-500 text-sm">to</span>
        <input
          type="date"
          value={value.end}
          onChange={handleEndChange}
          placeholder={endPlaceholder}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
