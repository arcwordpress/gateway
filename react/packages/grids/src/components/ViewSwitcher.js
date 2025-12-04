import { __ } from '@wordpress/i18n';
import React, { useState, useRef, useEffect } from 'react';

const VIEW_CONFIGS = {
  table: {
    label: __('Table', 'gateway'),
    icon: (
      <svg height="48" viewBox="0 0 170 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <g clipPath="url(#clip0_1_52)">
          <path d="M0 0H30.2222V30.1887H0V0Z" fill="#1D2327"/>
          <path d="M41.5556 0H107.667V30.1887H41.5556V0Z" fill="#1D2327"/>
          <path d="M119 0H170V30.1887H119V0Z" fill="#1D2327"/>
          <path d="M0 34.9057H30.2222V65.0943H0V34.9057Z" fill="#1D2327"/>
          <path d="M41.5556 34.9057H107.667V65.0943H41.5556V34.9057Z" fill="#1D2327"/>
          <path d="M119 34.9057H170V65.0943H119V34.9057Z" fill="#1D2327"/>
          <path d="M0 69.8113H30.2222V100H0V69.8113Z" fill="#1D2327"/>
          <path d="M41.5556 69.8113H107.667V100H41.5556V69.8113Z" fill="#1D2327"/>
          <path d="M119 69.8113H170V100H119V69.8113Z" fill="#1D2327"/>
        </g>
        <defs>
          <clipPath id="clip0_1_52">
            <rect width="170" height="100" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    )
  },
  board: {
    label: __('Board', 'gateway'),
    icon: (
      <svg height="48" viewBox="0 0 123 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <g clipPath="url(#clip0_1_14)">
          <rect width="123" height="100" fill="white"/>
          <path d="M0 0H34.562V100H0V0Z" fill="#1D2327"/>
          <path d="M44.7273 0H78.2727V68.3673H44.7273V0Z" fill="#1D2327"/>
          <path d="M89.4545 0H123V100H89.4545V0Z" fill="#1D2327"/>
        </g>
        <defs>
          <clipPath id="clip0_1_14">
            <rect width="123" height="100" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    )
  },
  list: {
    label: __('List', 'gateway'),
    icon: (
      <svg height="48" viewBox="0 0 127 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <g clipPath="url(#clip0_1_37)">
          <path d="M0 0H127V25H0V0Z" fill="#1D2327"/>
          <path d="M0 37.5H127V62.5H0V37.5Z" fill="#1D2327"/>
          <path d="M0 75H127V100H0V75Z" fill="#1D2327"/>
        </g>
        <defs>
          <clipPath id="clip0_1_37">
            <rect width="127" height="100" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    )
  },
  cards: {
    label: __('Cards', 'gateway'),
    icon: (
      <svg height="48" viewBox="0 0 118 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <g clipPath="url(#clip0_1_30)">
          <path d="M0 0H34.1205V44.6809H0V0Z" fill="#1D2327"/>
          <path d="M41.9398 0H76.0602V44.6809H41.9398V0Z" fill="#1D2327"/>
          <path d="M83.8795 0H118V44.6809H83.8795V0Z" fill="#1D2327"/>
          <path d="M0 55.3192H34.1205V100H0V55.3192Z" fill="#1D2327"/>
          <path d="M41.9398 55.3192H76.0602V100H41.9398V55.3192Z" fill="#1D2327"/>
          <path d="M83.8795 55.3192H118V100H83.8795V55.3192Z" fill="#1D2327"/>
        </g>
        <defs>
          <clipPath id="clip0_1_30">
            <rect width="118" height="100" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    )
  }
};

const ViewSwitcher = ({
  currentView,
  onViewChange,
  enabledViews = ['table', 'board', 'list', 'cards']
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!enabledViews || enabledViews.length === 0) return null;
  if (enabledViews.length === 1) return null;

  const currentConfig = VIEW_CONFIGS[currentView];
  const otherViews = enabledViews.filter(view => view !== currentView);

  // Close dropdown on outside click
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
    <div className="gateway-view-switcher">
      <div className="view-switcher" ref={dropdownRef}>
        <div
          className="view-switcher__active"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          tabIndex={0}
          role="button"
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <span className="view-switcher__icon">{currentConfig?.icon}</span>
          <span className="view-switcher__label view-switcher__label--hover">{currentConfig?.label}</span>
        </div>
        {open && (
          <ul className="view-switcher__dropdown" role="listbox">
            {otherViews.map((viewType) => {
              const config = VIEW_CONFIGS[viewType];
              if (!config) return null;
              return (
                <li key={viewType}>
                  <button
                    className="view-switcher__option"
                    onClick={() => {
                      setOpen(false);
                      onViewChange(viewType);
                    }}
                    type="button"
                    role="option"
                  >
                    <span className="view-switcher__icon">{config.icon}</span>
                    <span className="view-switcher__label view-switcher__label--hover">{config.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewSwitcher;