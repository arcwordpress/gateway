const FilterEditor = ({ filter, index, onUpdate, onMove, onRemove, isFirst, isLast, onBlur }) => {
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
            value={filter.type}
            onChange={(e) => onUpdate(index, 'type', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="text">Text</option>
            <option value="select">Select</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="daterange">Date Range</option>
            <option value="checkbox">Checkbox</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium !text-slate-400 mb-1">Field</label>
          <input
            type="text"
            value={filter.field}
            onChange={(e) => onUpdate(index, 'field', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="field_name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium !text-slate-400 mb-1">Label</label>
          <input
            type="text"
            value={filter.label}
            onChange={(e) => onUpdate(index, 'label', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Filter Label"
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

export default FilterEditor;
