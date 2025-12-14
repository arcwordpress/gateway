import { useNavigate } from 'react-router-dom';
import { useExtensions } from '../context/ExtensionsContext';
import { useActiveExtension } from '../context/ActiveExtensionContext';

const ExtensionSelector = () => {
  const navigate = useNavigate();
  const { extensions, loading, error } = useExtensions();
  const { activeExtension, setActiveExtension } = useActiveExtension();

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
      value={activeExtension?.key || ''}
      onChange={(e) => {
        const selected = extensions.find(ext => ext.key === e.target.value);
        if (selected) {
          setActiveExtension(selected);
          navigate(`/extension/${selected.key}`);
        } else {
          setActiveExtension(null);
          navigate('/');
        }
      }}
    >
      <option value="">Select an extension</option>
      {extensions.map((extension, index) => (
        <option key={extension.key || index} value={extension.key}>
          {extension.title || `Extension ${index + 1}`}
        </option>
      ))}
    </select>
  );
};

export default ExtensionSelector;
