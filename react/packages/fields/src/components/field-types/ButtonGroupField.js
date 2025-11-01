import { useState } from '@wordpress/element';

const ButtonGroupField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const options = fieldConfig.options || [];
  const currentValue = watch ? watch(fieldName) : '';

  // Normalize options to {label, value} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  const handleClick = (value) => {
    if (setValue) {
      setValue(fieldName, value, { shouldValidate: true });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden input for form registration */}
      <input type="hidden" {...register(fieldName)} />

      <div className="inline-flex rounded-md shadow-sm" role="group">
        {normalizedOptions.map((option, index) => {
          const isFirst = index === 0;
          const isLast = index === normalizedOptions.length - 1;
          const isSelected = currentValue === option.value;

          let roundedClass = '';
          if (isFirst && isLast) {
            roundedClass = 'rounded-md';
          } else if (isFirst) {
            roundedClass = 'rounded-l-md';
          } else if (isLast) {
            roundedClass = 'rounded-r-md';
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(option.value)}
              className={`
                px-4 py-2 text-sm font-medium border
                ${roundedClass}
                ${!isFirst ? '-ml-px' : ''}
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 z-10'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }
                focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-colors duration-150
              `.trim().replace(/\s+/g, ' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {fieldConfig.helpText && (
        <p className="mt-2 text-sm text-gray-500">{fieldConfig.helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default ButtonGroupField;
