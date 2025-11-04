/**
 * SelectFilter Component
 * HTML5 select box filter with configurable options
 *
 * @param {Object} props
 * @param {Array} props.choices - Array of {value, label} objects
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text for the select
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.className - Additional CSS classes
 */
const SelectFilter = ({
  choices = [],
  value = '',
  onChange,
  label = '',
  placeholder = 'Select...',
  className = '',
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[150px]"
      >
        <option value="">{placeholder}</option>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectFilter;
