import { HashRouter, Routes, Route } from 'react-router-dom';
import { ExtensionListProvider } from './context/ExtensionListContext';
import { ActiveExtensionProvider } from './context/ActiveExtensionContext';
import LeftSidebar from './components/LeftSidebar';
import Breadcrumbs from './components/Breadcrumbs';
import ExtensionCreate from './pages/ExtensionCreate';
import ExtensionView from './pages/ExtensionView';
import CollectionCreate from './pages/CollectionCreate';
import CollectionEditor from './pages/CollectionEditor';

const MaximizeIcon = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
      <path d="M22.2572 2.95556V8.66557H24V0H15.3344V1.74276H21.0444L1.74276 21.0444V15.3344H0V24H8.66557V22.2572H2.95556L22.2572 2.95556Z" fill="currentColor"/>
    </svg>
  );
};

const SettingsIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
      <path d="M2.66667 14V9.33331" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.66667 6.66667V2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 14V8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 5.33333V2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 14V10.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 8V2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M0.666672 9.33331H4.66667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 5.33331H10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.3333 10.6667H15.3333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const App = () => {
  return (
    <ExtensionListProvider>
      <ActiveExtensionProvider>
        <HashRouter>
          <div className="app-bg app-main-margin-fix min-h-screen flex border-l border-slate-600">
            <LeftSidebar />
            <div className="flex-1 flex flex-col">
              <header className="px-8 py-4 flex items-center justify-between border-b border-slate-600">
                <Breadcrumbs />
                <div className="flex items-center gap-4">
                  <MaximizeIcon />
                  <SettingsIcon />
                </div>
              </header>
            <main className="p-6">
              <Routes>
                <Route path="/extension/create" element={<ExtensionCreate />} />
                <Route path="/extension/:key/collection/create" element={<CollectionCreate />} />
                <Route path="/extension/:key/:collectionKey" element={<CollectionEditor />} />
                <Route path="/extension/:key" element={<ExtensionView />} />
                <Route path="/" element={<div>Home</div>} />
              </Routes>
            </main>
            </div>
          </div>
        </HashRouter>
      </ActiveExtensionProvider>
    </ExtensionListProvider>
  );
};

export default App;
