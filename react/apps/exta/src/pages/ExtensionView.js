import { useParams, Link } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { useExtensions } from '../context/ExtensionsContext';
import { useEffect } from '@wordpress/element';

const ExtensionView = () => {
  const { key } = useParams();
  const { extensions } = useExtensions();
  const { activeExtension, setActiveExtension } = useActiveExtension();

  // Set active extension based on URL param
  useEffect(() => {
    if (key && extensions.length > 0) {
      const extension = extensions.find(ext => ext.key === key);
      if (extension && (!activeExtension || activeExtension.key !== key)) {
        setActiveExtension(extension);
      }
    }
  }, [key, extensions, activeExtension, setActiveExtension]);

  if (!activeExtension) {
    return <div>Loading extension...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{activeExtension.title}</h1>
        <Link
          to={`/extension/${activeExtension.key}/collection/create`}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Collection
        </Link>
      </div>
      <div className="space-y-4">
        <div>
          <span className="font-medium">Key:</span> {activeExtension.key}
        </div>
        <pre className="p-4 bg-gray-50 rounded-lg overflow-auto">
          {JSON.stringify(activeExtension, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ExtensionView;
