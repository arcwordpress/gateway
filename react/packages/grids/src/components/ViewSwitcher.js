import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from 'react';
import { Rows2, Grid3x2, List } from 'lucide-react';

const ICON_SIZE = 24;

const VIEW_CONFIGS = {
  table: {
    label: __('Table', 'gateway'),
    Icon: Rows2,
  },
  list: {
    label: __('List', 'gateway'),
    Icon: List,
  },
  cards: {
    label: __('Cards', 'gateway'),
    Icon: Grid3x2,
  },
};

const ViewSwitcher = ({
  currentView,
  onViewChange,
  enabledViews = ['table', 'list', 'cards']
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!enabledViews || enabledViews.length < 2) return null;

  const currentConfig = VIEW_CONFIGS[currentView];
  const otherViews = enabledViews.filter(view => view !== currentView);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="view-switcher" ref={dropdownRef}>
      <button
        className="view-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        {currentConfig?.Icon && (
          <currentConfig.Icon size={ICON_SIZE} className="view-switcher__icon" />
        )}
      </button>
      {open && (
        <ul className="view-switcher__dropdown" role="listbox">
          {otherViews.map((viewType, idx) => {
            const config = VIEW_CONFIGS[viewType];
            if (!config) return null;
            return (
              <li
                key={viewType}
                className={idx > 0 ? 'view-switcher__option--divided' : ''}
              >
                <button
                  className="view-switcher__option"
                  onClick={() => {
                    setOpen(false);
                    onViewChange(viewType);
                  }}
                  type="button"
                  role="option"
                >
                  <config.Icon size={ICON_SIZE} className="view-switcher__icon" />
                  <span className="view-switcher__label">{config.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ViewSwitcher;
