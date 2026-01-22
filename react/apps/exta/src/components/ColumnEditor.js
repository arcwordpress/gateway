const ColumnEditor = ({ column, index, onUpdate, onMove, onRemove, isFirst, isLast, onBlur }) => {
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
          <label className="block text-xs font-medium !text-slate-400 mb-1">Field</label>
          <input
            type="text"
            value={column.field}
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
            value={column.label}
            onChange={(e) => onUpdate(index, 'label', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-slate-600 !text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Column Label"
          />
        </div>

        <div>
          <label className="block text-xs font-medium !text-slate-400 mb-1">Sortable</label>
          <div className="flex items-center h-[38px]">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={column.sortable || false}
                onChange={(e) => onUpdate(index, 'sortable', e.target.checked)}
                className="w-4 h-4 border-slate-600 rounded focus:ring-slate-500"
              />
              <span className="ml-2 text-sm !text-slate-400">Enable sorting</span>
            </label>
          </div>
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

export default ColumnEditor;
