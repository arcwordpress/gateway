import { useFieldTypeRegistry } from '../hooks/useFieldTypeRegistry';

// Helper to format field type labels (e.g., "date-picker" → "Date Picker")
const formatFieldTypeLabel = (type) => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Read a value from a field using a dot-notation path (e.g., "relation.endpoint")
const getNestedValue = (field, path) => {
  const parts = path.split('.');
  return parts.reduce((obj, key) => obj?.[key], field);
};

// Write a value to a field using a dot-notation path, returning [topKey, newTopValue]
const resolveUpdate = (field, path, value) => {
  const parts = path.split('.');
  if (parts.length === 1) {
    return [path, value];
  }
  const [parent, ...rest] = parts;
  const child = rest.join('.');
  const [, nestedValue] = resolveUpdate(field[parent] || {}, child, value);
  return [parent, { ...(field[parent] || {}), [child]: nestedValue }];
};

const FieldEditor = ({ field, index, onUpdate, onMove, onRemove, isFirst, isLast, onBlur }) => {
  const { fieldTypes, getFieldTypeConfig } = useFieldTypeRegistry();
  const selectedFieldTypeConfig = field.type ? getFieldTypeConfig(field.type) : null;

  return (
    <div className="flex gap-3 items-start p-3 bg-neutral-800 rounded-lg">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onMove(index, 'up')}
          disabled={isFirst}
          className="p-1 !text-slate-400 hover:!text-slate-200 disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'down')}
          disabled={isLast}
          className="p-1 !text-slate-400 hover:!text-slate-200 disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Field Type</label>
            <select
              value={field.type}
              onChange={(e) => onUpdate(index, 'type', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Type --</option>
              {fieldTypes.map(type => (
                <option key={type} value={type}>
                  {formatFieldTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(index, 'label', e.target.value)}
              onBlur={onBlur}
              className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Email Address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Field Name</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              onBlur={onBlur}
              className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., email_address"
            />
          </div>
        </div>

      {/* Render field type specific configuration */}
      {selectedFieldTypeConfig && selectedFieldTypeConfig.fields && selectedFieldTypeConfig.fields.length > 0 && (
        <div className="w-full mt-3 pt-3 border-t border-slate-700">
          <div className="text-xs font-medium !text-slate-400 mb-2">Field Configuration</div>
          <div className="grid gap-3">
            {selectedFieldTypeConfig.fields.map((fieldConfig, i) => {
              const currentValue = getNestedValue(field, fieldConfig.name);
              const displayValue = currentValue !== undefined && currentValue !== null
                ? currentValue
                : (fieldConfig.default !== undefined ? fieldConfig.default : '');
              return (
                <FieldConfigInput
                  key={i}
                  fieldConfig={fieldConfig}
                  value={displayValue}
                  onChange={(value) => {
                    const [topKey, topValue] = resolveUpdate(field, fieldConfig.name, value);
                    onUpdate(index, topKey, topValue);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 !text-red-400 hover:!text-red-300 hover:bg-neutral-700 rounded"
      >
        ✕
      </button>
    </div>
    </div>
  );
};

// Renders a single field config option using the correct input type
const FieldConfigInput = ({ fieldConfig, value, onChange }) => {
  const inputType = fieldConfig.type || 'text';
  const labelEl = (
    <label className="block text-xs font-medium !text-slate-400 mb-1">
      {fieldConfig.label || fieldConfig.name}
      {fieldConfig.required && <span className="!text-red-400 ml-1">*</span>}
    </label>
  );
  const descEl = fieldConfig.description
    ? <p className="mt-1 text-xs !text-slate-500">{fieldConfig.description}</p>
    : null;
  const inputClass = 'w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500';

  if (inputType === 'boolean') {
    return (
      <div>
        {labelEl}
        <select
          value={value === true || value === 'true' ? 'true' : 'false'}
          onChange={(e) => onChange(e.target.value === 'true')}
          className={inputClass}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        {descEl}
      </div>
    );
  }

  if (inputType === 'array') {
    const textValue = Array.isArray(value) ? value.join('\n') : (value || '');
    return (
      <div>
        {labelEl}
        <textarea
          value={textValue}
          onChange={(e) => {
            const lines = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
            onChange(lines);
          }}
          className={inputClass}
          placeholder={fieldConfig.placeholder || 'One item per line'}
          rows={3}
        />
        {descEl}
      </div>
    );
  }

  return (
    <div>
      {labelEl}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={fieldConfig.placeholder || fieldConfig.name}
      />
      {descEl}
    </div>
  );
};

export default FieldEditor;
