import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CollectionsProvider, useCollections } from './context/CollectionsContext';
import Dashboard from './pages/Dashboard';
import CollectionForm from './pages/CollectionForm';
import AppHeader from './components/AppHeader';

function AppContent() {
  const { collections, loading } = useCollections();

  if (loading) {
    return <div className="gty-app__loading">Loading...</div>;
  }

  return (
    <div className="gty-app">
      <AppHeader collections={collections} />
      <main className="gty-studio-main">
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
