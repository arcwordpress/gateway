import { useExtensions } from '../context/ExtensionsContext';

const ExtensionSelector = ({ value, onChange }) => {
  const { extensions, loading, error } = useExtensions();

  if (loading) {
    return (
      <select className="px-4 py-2 border border-gray-300 rounded-lg" disabled>
        <option>Loading extensions...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select className="px-4 py-2 border border-red-300 rounded-lg" disabled>
        <option>Error loading extensions</option>
      </select>
    );
  }

  if (!extensions || extensions.length === 0) {
    return (
      <select className="px-4 py-2 border border-gray-300 rounded-lg" disabled>
        <option>No extensions available</option>
      </select>
    );
  }

  return (
    <select
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">Select an extension</option>
      {extensions.map((extension, index) => (
        <option key={index} value={index}>
          {extension.title || `Extension ${index + 1}`}
        </option>
      ))}
    </select>
  );
};

export default ExtensionSelector;
