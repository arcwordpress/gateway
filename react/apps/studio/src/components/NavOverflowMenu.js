import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function NavOverflowMenu({ collections }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Check if any overflow item is active
  const hasActiveItem = collections.some(
    (collection) => location.pathname === `/collection/${collection.key}`
  );

  return (
    <div className="gty-admin-nav-overflow" ref={menuRef}>
      <button
        type="button"
        className={[
          'gty-admin-nav-overflow__trigger',
          hasActiveItem ? 'gty-admin-nav-overflow__trigger--active' : ''
        ].join(' ')}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="More collections"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4" cy="10" r="1.5" fill="currentColor" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
        </svg>
      </button>
      {isOpen && (
        <div className="gty-admin-nav-overflow__dropdown" role="menu">
          {collections.map((collection) => (
            <NavLink
              key={collection.key}
              to={`/collection/${collection.key}`}
              role="menuitem"
              className={({ isActive }) =>
                [
                  'gty-admin-nav-overflow__item',
                  isActive ? 'gty-admin-nav-overflow__item--active' : ''
                ].join(' ')
              }
            >
              {collection.titlePlural || collection.title || collection.key}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavOverflowMenu;
