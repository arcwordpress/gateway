import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/**
 * TextFilter Component
 * Text input filter with debouncing for search functionality
 *
 * @param {Object} props
 * @param {string} props.value - Current filter value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text for the input
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounce - Debounce delay in ms (default: 300)
 * @param {string} props.className - Additional CSS classes
 */
const TextFilter = ({
  value = '',
  onChange,
  label = '',
  placeholder = 'Search...',
  debounce = 300,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounce);

    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange, value]);

  // Update local value when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className={`text-filter ${className}`.trim()}>
      <div className="text-filter__input-wrapper">
        <Search className="text-filter__icon" aria-hidden="true" />
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="text-filter__input"
        />
      </div>
    </div>
  );
};

export default TextFilter;
