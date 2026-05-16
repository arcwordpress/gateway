import React, { useState, useRef, useEffect } from 'react';

const S = {
  wrap: {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  control: (open) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '38px',
    padding: '0 8px',
    backgroundColor: '#18181b',
    border: `1px solid ${open ? '#71717a' : '#27272a'}`,
    borderRadius: '0.5rem',
    boxShadow: open ? '0 0 0 1px #71717a' : 'none',
    boxSizing: 'border-box',
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
  }),
  label: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#f4f4f5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  placeholder: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#71717a',
  },
  arrow: {
    flexShrink: 0,
    marginLeft: '6px',
    color: '#71717a',
    fontSize: '11px',
    lineHeight: 1,
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 9999,
    overflow: 'hidden',
  },
  searchWrap: {
    padding: '6px 8px',
    borderBottom: '1px solid #27272a',
  },
  searchInput: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '0.375rem',
    color: '#f4f4f5',
    fontSize: '0.875rem',
    padding: '4px 8px',
    outline: 'none',
  },
  list: {
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '4px 0',
  },
  option: (focused, selected) => ({
    padding: '6px 12px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    backgroundColor: selected ? '#3f3f46' : focused ? '#27272a' : 'transparent',
    color: selected ? '#fff' : '#d4d4d8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  empty: {
    padding: '8px 12px',
    fontSize: '0.875rem',
    color: '#71717a',
  },
};

/**
 * Searchable field-type selector (custom, no external UI library).
 *
 * Props:
 *   value       – current type string (e.g. "text", "relation")
 *   onChange    – (typeString) => void
 *   options     – FieldTypeDef[] ({ type, label? }) or plain { value, label }[]
 *   isLoading   – show loading placeholder while types are being fetched
 *   isDisabled  – disable the control
 *   placeholder – placeholder text
 */
export function FieldTypeSelector({
  value,
  onChange,
  options = [],
  isLoading = false,
  isDisabled = false,
  placeholder = 'Select type…',
}) {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const wrapRef   = useRef(null);
  const searchRef = useRef(null);
  const listRef   = useRef(null);

  const normalised = options
    .map((o) => ({
      value: o.value ?? o.type,
      label: o.label ?? formatLabel(o.value ?? o.type ?? ''),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const filtered = query
    ? normalised.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : normalised;

  const selected = normalised.find((o) => o.value === value) ?? null;

  // Focus search input when menu opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
      setFocusedIdx(selected ? Math.max(0, filtered.findIndex((o) => o.value === value)) : 0);
    } else {
      setQuery('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset focused index when search query changes
  useEffect(() => { setFocusedIdx(0); }, [query]);

  // Scroll focused option into view
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[focusedIdx]?.scrollIntoView({ block: 'nearest' });
  }, [focusedIdx, open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape')    { setOpen(false); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); const o = filtered[focusedIdx]; if (o) pick(o); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, focusedIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (opt) => { onChange(opt.value); setOpen(false); };

  const openMenu = () => { if (!isDisabled && !isLoading) setOpen(true); };

  const displayLabel = isLoading ? 'Loading…' : (selected?.label ?? null);

  return (
    <div ref={wrapRef} style={S.wrap}>
      {/* Control — clicking opens the menu */}
      <div
        style={S.control(open)}
        onClick={openMenu}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); } }}
        tabIndex={isDisabled ? -1 : 0}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span style={displayLabel ? S.label : S.placeholder}>
          {displayLabel ?? placeholder}
        </span>
        <span style={S.arrow} aria-hidden="true">{open ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={S.menu} role="listbox">
          <div style={S.searchWrap}>
            <input
              ref={searchRef}
              style={S.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div ref={listRef} style={S.list}>
            {filtered.length === 0
              ? <div style={S.empty}>No match</div>
              : filtered.map((opt, i) => (
                <div
                  key={opt.value}
                  style={S.option(i === focusedIdx, opt.value === value)}
                  onMouseDown={() => pick(opt)}
                  onMouseEnter={() => setFocusedIdx(i)}
                  role="option"
                  aria-selected={opt.value === value}
                >
                  {opt.label}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

function formatLabel(type) {
  return type
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
