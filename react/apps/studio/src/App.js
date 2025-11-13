import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CollectionsProvider, useCollections } from './context/CollectionsContext';
import Dashboard from './pages/Dashboard';
import CollectionForm from './pages/CollectionForm';

function AppContent() {
  const { collections, loading } = useCollections();

  if (loading) {
    return <div className="gty-app__loading">Loading...</div>;
  }

  return (
    <div className="gty-app">
      <nav className="gty-nav">
        <div className="gty-nav__container">
          <div className="gty-nav__inner">
            <div className="gty-nav__content">
              <div className="gty-nav__brand">
                <h1 className="gty-nav__brand-title">Gateway</h1>
              </div>
              <div className="gty-nav__links">
                {collections.map((collection) => (
                  <Link
                    key={collection.key}
                    to={`/collection/${collection.key}`}
                    className="gty-nav__link"
                  >
                    {collection.titlePlural || collection.title || collection.key}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="gty-main">
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

function App({ packageKey }) {
  return (
    <Router>
      <CollectionsProvider packageKey={packageKey}>
        <AppContent />
      </CollectionsProvider>
    </Router>
  );
}

export default App;
