import { getRegisteredFieldTypes } from '@arcwp/gateway-forms';

// Helper to format field type labels (e.g., "date-picker" → "Date Picker")
const formatFieldTypeLabel = (type) => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const FieldEditor = ({ field, index, onUpdate, onMove, onRemove, isFirst, isLast, onBlur }) => {
  const fieldTypes = getRegisteredFieldTypes();

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

      <div className="flex-1 grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium !text-slate-400 mb-1">Type</label>
          <select
            value={field.type}
            onChange={(e) => onUpdate(index, 'type', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {fieldTypes.map(type => (
              <option key={type} value={type}>
                {formatFieldTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium !text-slate-400 mb-1">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate(index, 'label', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Field Label"
          />
        </div>

        <div>
          <label className="block text-xs font-medium !text-slate-400 mb-1">Name</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="field_name"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 !text-red-400 hover:!text-red-300 hover:bg-neutral-700 rounded"
      >
        ✕
      </button>
    </div>
  );
};

export default FieldEditor;
