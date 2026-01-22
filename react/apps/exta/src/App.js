import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { ExtensionListProvider } from './context/ExtensionListContext';
import { ActiveExtensionProvider } from './context/ActiveExtensionContext';
import ExtensionSelector from './components/ExtensionSelector';
import LeftSidebar from './components/LeftSidebar';
import ExtensionCreate from './pages/ExtensionCreate';
import ExtensionView from './pages/ExtensionView';
import CollectionCreate from './pages/CollectionCreate';
import CollectionEditor from './pages/CollectionEditor';

const Logo = () => {
  return (
    <div className="font-lexend text-[3rem] font-black">
      GATEWAY
    </div>
  );
};

const MaximizeIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.2572 2.95556V8.66557H24V0H15.3344V1.74276H21.0444L1.74276 21.0444V15.3344H0V24H8.66557V22.2572H2.95556L22.2572 2.95556Z" fill="black"/>
    </svg>
  );
};

const App = () => {
  return (
    <ExtensionListProvider>
      <ActiveExtensionProvider>
        <HashRouter>
          <div className="app-bg app-main-margin-fix min-h-screen flex" style={{borderLeft: 'solid 1px rgb(255,255,255,0.25)'}}>
            <LeftSidebar />
            <div className="flex-1 flex flex-col">
              <header className="border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Logo />
                  <ExtensionSelector />
                  <Link
                  to="/extension/create"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Extension
                </Link>
              </div>
              <MaximizeIcon />
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
