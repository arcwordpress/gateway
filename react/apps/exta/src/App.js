import { HashRouter, Routes, Route } from 'react-router-dom';
import { ExtensionListProvider } from './context/ExtensionListContext';
import { ActiveExtensionProvider } from './context/ActiveExtensionContext';
import LeftSidebar from './components/LeftSidebar';
import Breadcrumbs from './components/Breadcrumbs';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ExtensionCreate from './pages/ExtensionCreate';
import ExtensionView from './pages/ExtensionView';
import CollectionCreate from './pages/CollectionCreate';
import CollectionEditor from './pages/CollectionEditor';
import FieldsEditor from './pages/FieldsEditor';
import FormsEditor from './pages/FormsEditor';
import GridsEditor from './pages/GridsEditor';
import RelationshipsEditor from './pages/RelationshipsEditor';

const App = () => {
  return (
    <ExtensionListProvider>
      <ActiveExtensionProvider>
        <HashRouter>
          <div id="gateway-exta-app" className="app-bg app-main-margin-fix min-h-screen flex border-l border-slate-600">
            <LeftSidebar />
            <div className="flex-1 flex flex-col">
              <header className="px-8 py-4 border-b border-slate-600">
                <Breadcrumbs />
              </header>
            <main className="px-8 py-6 flex-1">
              <Routes>
                <Route path="/extension/create" element={<ExtensionCreate />} />
                <Route path="/extension/:key/collection/create" element={<CollectionCreate />} />
                <Route path="/extension/:key/collection/:collectionKey/fields" element={<FieldsEditor />} />
                <Route path="/extension/:key/collection/:collectionKey/forms" element={<FormsEditor />} />
                <Route path="/extension/:key/collection/:collectionKey/grids" element={<GridsEditor />} />
                <Route path="/extension/:key/collection/:collectionKey/relationships" element={<RelationshipsEditor />} />
                <Route path="/extension/:key/collection/:collectionKey" element={<CollectionEditor />} />
                <Route path="/extension/:key" element={<ExtensionView />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </main>
              <Footer />
            </div>
          </div>
        </HashRouter>
      </ActiveExtensionProvider>
    </ExtensionListProvider>
  );
};

export default App;
