const FieldEditor = ({ field, index, onUpdate, onMove, onRemove, isFirst, isLast, onBlur }) => {
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={field.type}
            onChange={(e) => onUpdate(index, 'type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="url">URL</option>
            <option value="date">Date</option>
            <option value="checkbox">Checkbox</option>
            <option value="select">Select</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate(index, 'label', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Field Label"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            onBlur={onBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="field_name"
          />
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

export default FieldEditor;
