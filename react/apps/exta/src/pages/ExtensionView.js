import { useParams, Link } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import { useExtensionList } from '../context/ExtensionListContext';
import { useEffect } from '@wordpress/element';

const ExtensionView = () => {
  const { key } = useParams();
  const { extensions } = useExtensionList();
  const { activeExtension, setActiveExtension, collections, collectionsLoading, collectionsError } = useActiveExtension();

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
      
      <div className="space-y-6">
        <div>
          <span className="font-medium">Key:</span> {activeExtension.key}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Collections</h2>
          {collectionsLoading && <div>Loading collections...</div>}
          {collectionsError && <div className="text-red-600">{collectionsError}</div>}
          {!collectionsLoading && !collectionsError && collections.length === 0 && (
            <div className="text-gray-500">No collections yet</div>
          )}
          {!collectionsLoading && collections.length > 0 && (
            <div className="grid gap-4">
              {collections.map((collection) => (
                <Link
                  key={collection.key}
                  to={`/extension/${activeExtension.key}/${collection.key}`}
                  className="block p-4 border rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium">{collection.title || collection.key}</h3>
                  {collection.description && (
                    <p className="text-gray-600 text-sm mt-1">{collection.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Extension Data</h2>
          <pre className="p-4 bg-gray-50 rounded-lg overflow-auto">
            {JSON.stringify(activeExtension, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ExtensionView;
