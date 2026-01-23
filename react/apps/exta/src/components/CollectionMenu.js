import { useState } from '@wordpress/element';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useActiveExtension } from '../context/ActiveExtensionContext';

const CollectionMenu = () => {
  const location = useLocation();
  const params = useParams();
  const { activeExtension, collections, collectionsLoading } = useActiveExtension();
  const [expandedCollection, setExpandedCollection] = useState(params.collectionKey || null);

  if (!activeExtension || collectionsLoading) {
    return null;
  }

  const toggleCollection = (collectionKey) => {
    setExpandedCollection(expandedCollection === collectionKey ? null : collectionKey);
  };

  const sections = [
    { key: 'fields', label: 'Fields' },
    { key: 'forms', label: 'Forms' },
    { key: 'grids', label: 'Grids' },
    { key: 'relationships', label: 'Relationships' },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4 !text-slate-200">
        {activeExtension.title || activeExtension.key}
      </h2>

      {collections.length === 0 ? (
        <div className="!text-slate-500 text-sm">No collections</div>
      ) : (
        <nav className="space-y-1">
          {collections.map((collection) => {
            const isExpanded = expandedCollection === collection.key;
            const isCollectionActive = params.collectionKey === collection.key;

            return (
              <div key={collection.key}>
                <button
                  onClick={() => toggleCollection(collection.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    isCollectionActive
                      ? 'bg-neutral-800 !text-slate-200'
                      : 'hover:bg-neutral-800 !text-slate-400'
                  }`}
                >
                  <span>{collection.title || collection.key}</span>
                  <span className="text-xs">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {sections.map((section) => {
                      const sectionPath = `/extension/${activeExtension.key}/collection/${collection.key}/${section.key}`;
                      const isSectionActive = location.pathname === sectionPath;

                      return (
                        <Link
                          key={section.key}
                          to={sectionPath}
                          className={`block px-3 py-1.5 rounded text-sm transition-colors ${
                            isSectionActive
                              ? 'bg-neutral-700 !text-slate-200'
                              : 'hover:bg-neutral-800 !text-slate-500'
                          }`}
                        >
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default CollectionMenu;
