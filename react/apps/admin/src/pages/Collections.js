import { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const getRouteTypeName = (type) => {
    const typeMap = {
      get_many: 'Get Many',
      get_one: 'Get One',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
    };
    return typeMap[type] || type;
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/admin-data`,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setCollections(data.collections || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Registered Collections</h2>
        <p className="text-gray-600 mt-1">
          {collections.length} collection{collections.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">No collections registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {collections.map((collection) => (
            <div
              key={collection.key}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {collection.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Key</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {collection.key}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Class Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {collection.className}
                  </dd>
                </div>

                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Fully Qualified Class Name (FQCN)</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded break-all">
                    {collection.fqcn}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Database Table</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {collection.table}
                  </dd>
                </div>
              </div>

              {/* API Routes Section */}
              {collection.routes && collection.routes.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">API Routes</h4>
                  <Accordion
                    items={collection.routes.map((route) => ({
                      trigger: (
                        <>
                          <span
                            className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded font-semibold text-xs ${
                              route.method === 'GET'
                                ? 'bg-blue-100 text-blue-800'
                                : route.method === 'POST'
                                ? 'bg-green-100 text-green-800'
                                : route.method === 'PUT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : route.method === 'DELETE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {route.method}
                          </span>
                          <code className="text-sm text-gray-900">
                            {route.displayRoute}
                          </code>
                        </>
                      ),
                      content: (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Type:</span>
                            <span className="ml-2 text-sm text-gray-900">
                              {getRouteTypeName(route.type)} ({route.type})
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Route Pattern:</span>
                            <code className="ml-2 text-sm text-gray-900">{route.route}</code>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Namespace:</span>
                            <code className="ml-2 text-sm text-gray-900">{route.namespace}</code>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Path:</span>
                            <code className="ml-2 text-sm text-gray-900">{route.path}</code>
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Collections;
