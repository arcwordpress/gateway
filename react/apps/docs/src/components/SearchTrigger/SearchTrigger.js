import React, { useState, useEffect, useRef } from 'react';
import './style.css';

// Generic Modal component
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="gty-modal-overlay" onClick={onClose}>
            <div className="gty-modal" onClick={e => e.stopPropagation()}>
                <button className="gty-modal-close" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
}

// Search modal content
function SearchModal({ open, onClose }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose}>
            <input
                ref={inputRef}
                type="search"
                placeholder="Type to search..."
                className="gty-search-input"
            />
        </Modal>
    );
}

// Search trigger component
function SearchTrigger() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(o => !o);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div
                className="gty-search-trigger"
                tabIndex={0}
                role="button"
                onClick={() => setOpen(true)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}
            >
                <span className="gty-search-placeholder">Search docs...</span>
                <span className="gty-search-shortcut">Ctrl K</span>
            </div>
            <SearchModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}

export default SearchTrigger;