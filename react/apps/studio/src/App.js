import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CollectionsProvider, useCollections } from './context/CollectionsContext';
import Dashboard from './pages/Dashboard';
import CollectionForm from './pages/CollectionForm';

function AppContent() {
  const { collections, loading } = useCollections();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="-ml-[22px] min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Gateway</h1>
              </div>
              <div className="sm:ml-6 sm:flex sm:space-x-8">
                {collections.map((collection) => (
                  <Link
                    key={collection.key}
                    to={`/collection/${collection.key}`}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    {collection.titlePlural || collection.title || collection.key}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collection/:collectionKey" element={<Dashboard />} />
          <Route path="/collection/:collectionKey/create" element={<CollectionForm />} />
          <Route path="/collection/:collectionKey/edit/:id" element={<CollectionForm />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <CollectionsProvider>
        <AppContent />
      </CollectionsProvider>
    </Router>
  );
}

export default App;
