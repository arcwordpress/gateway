import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { CollectionsProvider, useCollections } from './context/CollectionsContext';
import Dashboard from './pages/Dashboard';
import CollectionForm from './pages/CollectionForm';
import AppHeader from './components/AppHeader';

function AppContent({ collectionKey }) {
  const { collections, loading } = useCollections();

  if (loading) {
    return <div className="gty-app__loading">Loading...</div>;
  }

  return (
    <div className="gty-app">
      <AppHeader collections={collections} />
      <main className="gty-studio-main">
        <Routes>
          <Route path="/" element={
            collectionKey ? <Navigate to={`/collection/${collectionKey}`} replace /> : <Dashboard />
          } />
          <Route path="/collection/:collectionKey" element={<Dashboard />} />
          <Route path="/collection/:collectionKey/create" element={<CollectionForm />} />
          <Route path="/collection/:collectionKey/edit/:id" element={<CollectionForm />} />
        </Routes>
      </main>
    </div>
  );
}

function App({ packageKey, collectionKey }) {
  return (
    <Router>
      <CollectionsProvider packageKey={packageKey}>
        <AppContent collectionKey={collectionKey} />
      </CollectionsProvider>
    </Router>
  );
}

export default App;
