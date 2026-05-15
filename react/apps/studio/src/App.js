import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CollectionsProvider, useCollections } from './context/CollectionsContext';
import Dashboard from './pages/Dashboard';
import CollectionForm from './pages/CollectionForm';
import CollectionRecordView from './pages/CollectionRecordView';

function AppContent() {
  const { collections, loading } = useCollections();

  if (loading) {
    return <div className="gty-app__loading">Loading...</div>;
  }

  return (
    <div className="gty-app">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/collection/:collectionKey" element={<Dashboard />} />
        <Route path="/collection/:collectionKey/create" element={<CollectionForm />} />
        <Route path="/collection/:collectionKey/edit/:id" element={<CollectionForm />} />
        <Route path="/collection/:collectionKey/view/:id" element={<CollectionRecordView />} />
      </Routes>
    </div>
  );
}

function App({ packageKey, packageLabel }) {
  return (
    <Router>
      <CollectionsProvider packageKey={packageKey} packageLabel={packageLabel}>
        <AppContent />
      </CollectionsProvider>
    </Router>
  );
}

export default App;
