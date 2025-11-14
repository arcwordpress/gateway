import './style.css';

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
    <div className={['date-range-filter', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="date-range-filter__label">
          {label}
        </label>
      )}
      <div className="date-range-filter__inputs">
        <input
          type="date"
          value={value.start}
          onChange={handleStartChange}
          placeholder={startPlaceholder}
          className="date-range-filter__input"
        />
        <span className="date-range-filter__separator">to</span>
        <input
          type="date"
          value={value.end}
          onChange={handleEndChange}
          placeholder={endPlaceholder}
          className="date-range-filter__input"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
