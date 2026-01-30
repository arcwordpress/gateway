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
    return <div className="!text-slate-500">Loading extension...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold !text-slate-200">{activeExtension.title}</h1>
        <Link
          to={`/extension/${activeExtension.key}/collection/create`}
          className="px-4 py-2 bg-black !text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Collection
        </Link>
      </div>
      
      <div className="space-y-6">
        <div className="!text-slate-500">
          <span className="font-medium">Key:</span> {activeExtension.key}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 !text-slate-200">Collections</h2>
          {collectionsLoading && <div className="!text-slate-500">Loading collections...</div>}
          {collectionsError && <div className="!text-red-500">{collectionsError}</div>}
          {!collectionsLoading && !collectionsError && collections.length === 0 && (
            <div className="!text-slate-500">No collections yet</div>
          )}
          {!collectionsLoading && collections.length > 0 && (
            <div className="grid gap-4">
              {collections.map((collection) => (
                <Link
                  key={collection.key}
                  to={`/extension/${activeExtension.key}/collection/${collection.key}`}
                  className="block p-4 bg-neutral-900 border border-slate-600 rounded-lg hover:border-slate-500 hover:bg-neutral-800 transition-colors"
                >
                  <h3 className="font-medium !text-slate-200">{collection.title || collection.key}</h3>
                  {collection.description && (
                    <p className="!text-slate-500 text-sm mt-1">{collection.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 !text-slate-200">Extension Data</h2>
          <pre className="p-4 bg-neutral-900 !text-slate-300 rounded-lg overflow-auto">
            {JSON.stringify(activeExtension, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ExtensionView;
