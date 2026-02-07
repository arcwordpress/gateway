import { useFieldTypeRegistry } from '../hooks/useFieldTypeRegistry';

// Helper to format field type labels (e.g., "date-picker" → "Date Picker")
const formatFieldTypeLabel = (type) => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
            {selectedFieldTypeConfig.fields.map((fieldConfig, i) => (
              <FieldConfigInput
                key={i}
                fieldConfig={fieldConfig}
                value={field.config?.[fieldConfig.name] || ''}
                onChange={(value) => {
                  const config = field.config || {};
                  onUpdate(index, 'config', { ...config, [fieldConfig.name]: value });
                }}
              />
            ))}
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

// Helper component to render individual field config inputs - simple text-based for now
const FieldConfigInput = ({ fieldConfig, value, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-medium !text-slate-400 mb-1">
        {fieldConfig.label || fieldConfig.name}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
        placeholder={fieldConfig.name}
      />
    </div>
  );
};

export default FieldEditor;
