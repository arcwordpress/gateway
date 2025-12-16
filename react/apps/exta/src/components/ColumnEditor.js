const ColumnEditor = ({ column, index, onUpdate, onMove, onRemove, isFirst, isLast, onBlur }) => {
  return (
    <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onMove(index, 'up')}
          disabled={isFirst}
          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'down')}
          disabled={isLast}
          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
          <input
            type="text"
            value={column.field}
            onChange={(e) => onUpdate(index, 'field', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="field_name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            value={column.label}
            onChange={(e) => onUpdate(index, 'label', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Column Label"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sortable</label>
          <div className="flex items-center h-[38px]">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={column.sortable || false}
                onChange={(e) => onUpdate(index, 'sortable', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable sorting</span>
            </label>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
      >
        ✕
      </button>
    </div>
  );
};

export default ColumnEditor;
