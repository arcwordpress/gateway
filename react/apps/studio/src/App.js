import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CollectionsProvider, useCollections } from './context/CollectionsContext';
import Dashboard from './pages/Dashboard';
import CollectionForm from './pages/CollectionForm';
import CollectionRecordView from './pages/CollectionRecordView';

function StudioSkeleton() {
  return (
    <div className="gty-app">
      <div className="studio-layout studio-skeleton">
        <aside className="studio-sidebar">
          <div className="skeleton-block" style={{ width: '70%', height: '1.25rem', marginBottom: '1rem' }} />
          <div className="skeleton-block" style={{ width: '100%', height: '2.25rem' }} />
        </aside>
        <main className="studio-main">
          <div className="skeleton-block" style={{ width: '40%', height: '1rem', marginBottom: '1rem' }} />
          <div className="skeleton-block" style={{ width: '100%', height: '2.5rem', marginBottom: '0.5rem' }} />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton-block" style={{ width: '100%', height: '2.5rem', marginBottom: '0.375rem' }} />
          ))}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { collections, loading } = useCollections();

  if (loading) {
    return <StudioSkeleton />;
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
