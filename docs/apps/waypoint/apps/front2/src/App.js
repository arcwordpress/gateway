import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/Home/Home';
import DocSetPage from './components/pages/DocSetPage';
import DocGroupPage from './components/pages/DocGroupPage';
import DocPage from './components/pages/DocPage';
import './index.css';

// Get the first path segment as the basename
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const basename = pathSegments.length ? `/${pathSegments[0]}` : '/';

function App() {
    return (
        <Router basename={basename}>
            <div className="waypoint-app">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/:docsetSlug" element={<DocSetPage />} />
                    <Route path="/:docsetSlug/:groupSlug" element={<DocGroupPage />} />
                    <Route path="/:docsetSlug/:groupSlug/:docSlug" element={<DocPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
