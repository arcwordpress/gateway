import { useState, useEffect } from '@wordpress/element';
import { useDataStore } from '../../../store/dataStore';
import DocSetsList from '../../DocSetsList/DocSetsList';
import SearchModal from '../../SearchModal/SearchModal';
import { Search } from 'lucide-react';
import './style.css';

function Home() {
    const { data, loading, error } = useDataStore();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setModalIsOpen(o => !o);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="home-page">
            <h1 className="home-page__heading">Gateway Documentation</h1>

            <button className="doc-search" onClick={() => setModalIsOpen(true)}>
                <Search className="doc-search__icon" size={18} />
                <span className="doc-search__label">Search docs...</span>
                <span className="doc-search__shortcut">Ctrl K</span>
            </button>

            {loading && (
                <div className="home-page__skeleton">
                    <div className="home-page__skeleton-item"></div>
                    <div className="home-page__skeleton-item"></div>
                    <div className="home-page__skeleton-item home-page__skeleton-item--faded"></div>
                </div>
            )}
            {error && <p className="home-page__error">Error: {error}</p>}

            {!loading && !error && data && (
                <div className="home-page__content">
                    <DocSetsList docsets={data.docSets} />

                    <div className="home-page__footer">
                        <p className="home-page__footer-title">Powered by Waypoint</p>
                        <p className="home-page__footer-desc">Waypoint is a documentation engine for WordPress. It is available at no extra cost to all Gateway license holders.</p>
                    </div>
                </div>
            )}

            <SearchModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} />
        </div>
    );
}

export default Home;
