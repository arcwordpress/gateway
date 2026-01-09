import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Accordion from '../components/Accordion';
import RouteTest from '../components/RouteTest';

function CollectionDetail() {
  const { collectionKey } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [migrationModal, setMigrationModal] = useState({ isOpen: false, migration: null, loading: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCollection();
  }, [collectionKey]);

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

  const fetchCollection = async () => {
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
      const foundCollection = data.collections.find(c => c.key === collectionKey);

      if (!foundCollection) {
        throw new Error(`Collection "${collectionKey}" not found`);
      }

      setCollection(foundCollection);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const generateMigration = async () => {
    setMigrationModal({ isOpen: true, migration: null, loading: true });

    try {
      const response = await fetch(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/migrations/${collectionKey}`,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate migration');
      }

      const data = await response.json();
      setMigrationModal({ isOpen: true, migration: data.migration, loading: false });
    } catch (err) {
      alert('Error generating migration: ' + err.message);
      setMigrationModal({ isOpen: false, migration: null, loading: false });
    }
  };

  const copyToClipboard = async () => {
    if (!migrationModal.migration?.code) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(migrationModal.migration.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = migrationModal.migration.code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Failed to copy to clipboard. Please copy manually.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      alert('Failed to copy to clipboard. Please copy manually.');
    }
  };

  const closeMigrationModal = () => {
    setMigrationModal({ isOpen: false, migration: null, loading: false });
    setCopied(false);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-4">
          <Link to="/collections" className="text-indigo-600 hover:text-indigo-700">
            ← Back to all collections
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link to="/collections" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← Back to all collections
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">{collection.title}</h2>
        <p className="text-gray-600 mt-1">Collection details and configuration</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {collection.title}
          </h3>
          <button
            onClick={generateMigration}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Generate Migration
          </button>
        </div>

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
                    <RouteTest route={route} collectionKey={collection.key} />
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </div>

      {/* Migration Modal */}
      {migrationModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {migrationModal.loading ? 'Generating Migration...' : 'Database Migration'}
              </h3>
              <button
                onClick={closeMigrationModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {migrationModal.loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Generating migration code...</p>
                </div>
              ) : migrationModal.migration ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Usage Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Save this file to your plugin (e.g., <code className="bg-blue-100 px-1 rounded">/lib/{migrationModal.migration.className}.php</code>)</li>
                      <li>Require the file in your plugin</li>
                      <li>Call <code className="bg-blue-100 px-1 rounded">{migrationModal.migration.className}::create()</code> from your activation hook</li>
                    </ol>
                  </div>

                  {migrationModal.migration.notes && migrationModal.migration.notes.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Notes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                        {migrationModal.migration.notes.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Generated Code:</h4>
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
                      >
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{migrationModal.migration.code}</code>
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeMigrationModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionDetail;
