import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const menu = document.querySelector('.gty-admin-menu');
    if (!menu) return;
    let scrollTimeout;
    const onScroll = () => {
      menu.classList.add('gty-admin-menu--scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        menu.classList.remove('gty-admin-menu--scrolling');
      }, 120);
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Router>
      <div className="gty-admin-app">
        <Header />
        <main className="gty-admin-app__main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
        <div className="gty-admin-version-label">GATEWAY V1.1.6</div>
      </div>
    </Router>
  );
}

export default App;
