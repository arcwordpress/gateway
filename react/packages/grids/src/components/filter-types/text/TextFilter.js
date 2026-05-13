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
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-8 pr-3 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-sm min-w-[200px]"
        />
      </div>
    </div>
  );
};

export default TextFilter;
