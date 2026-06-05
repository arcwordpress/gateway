import { useState, useEffect, useRef } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { Search, X } from 'lucide-react';
import Modal from 'react-modal';
import api from '../../api';
import './style.css';

Modal.setAppElement('#gateway-app-docs');

function SearchModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { data } = useDataStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef(null);

    function handleClose() {
        onClose();
        setQuery('');
        setResults([]);
    }

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await api.get('docs', { params: { search: query, per_page: 10 } });
                setResults(response?.data?.data?.items || []);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    function handleResultClick(doc) {
        if (!data) return;
        const docGroup = data.getDocGroupById(doc.doc_group_id);
        if (!docGroup) return;
        const docSet = data.getDocSetById(docGroup.doc_set_id);
        if (!docSet) return;
        handleClose();
        navigate(`/${docSet.slug}/${docGroup.slug}/${doc.slug}`);
    }

    return (
        <Modal
            className="search-modal"
            overlayClassName="search-modal-overlay"
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Search Docs"
        >
            <div className="search-modal__header">
                <Search size={18} className="search-modal__search-icon" />
                <input
                    ref={inputRef}
                    className="search-modal__input"
                    type="search"
                    placeholder="Search docs..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoComplete="off"
                />
                <button className="search-modal__close" onClick={handleClose} aria-label="Close search">
                    <X size={18} />
                </button>
            </div>

            <div className="search-modal__results">
                {searching && (
                    <div className="search-modal__status">Searching...</div>
                )}
                {!searching && query.trim().length >= 3 && results.length === 0 && (
                    <div className="search-modal__status">No results for &ldquo;{query}&rdquo;</div>
                )}
                {!searching && results.length > 0 && (
                    <ul className="search-modal__list">
                        {results.map(doc => (
                            <li key={doc.id}>
                                <button
                                    className="search-modal__result"
                                    onClick={() => handleResultClick(doc)}
                                >
                                    <span className="search-modal__result-title">{doc.title}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {query.trim().length < 3 && (
                    <div className="search-modal__status">
                        {query.trim().length === 0 ? 'Start typing to search…' : 'Keep typing…'}
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default SearchModal;
