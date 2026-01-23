import { useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';
import CollectionNav from '../components/CollectionNav';

const RelationshipsEditor = () => {
  const { key: extensionKey, collectionKey } = useParams();
  const { activeExtension, collections } = useActiveExtension();

  const collection = collections?.find(c => c.key === collectionKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold !text-slate-200 mb-2">
          {collection?.title || collectionKey}
        </h1>
      </div>

      <CollectionNav extensionKey={extensionKey} collectionKey={collectionKey} />

      <div className="p-6 bg-neutral-800 rounded-lg border border-slate-600">
        <h2 className="text-lg font-medium !text-slate-200 mb-4">Relationships Editor</h2>
        <p className="!text-slate-400">
          Relationships editor interface coming soon...
        </p>
      </div>
    </div>
  );
};

export default RelationshipsEditor;
