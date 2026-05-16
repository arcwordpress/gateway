import React from 'react';
import ReactSelect from 'react-select';

// Dark zinc theme matching the Raptor/Studio admin UI.
const darkStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#18181b',
    borderColor: state.isFocused ? '#71717a' : '#27272a',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 1px #71717a' : 'none',
    minHeight: '38px',
    '&:hover': { borderColor: '#3f3f46' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px 0',
    maxHeight: '220px',
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#3f3f46' : isFocused ? '#27272a' : 'transparent',
    color: isSelected ? '#fff' : '#d4d4d8',
    fontSize: '0.875rem',
    padding: '6px 12px',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#52525b' },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f4f4f5',
    fontSize: '0.875rem',
  }),
  input: (base) => ({
    ...base,
    color: '#f4f4f5',
    fontSize: '0.875rem',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#71717a',
    fontSize: '0.875rem',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#52525b',
    '&:hover': { color: '#a1a1aa' },
    padding: '0 8px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  clearIndicator: (base) => ({
    ...base,
    color: '#52525b',
    '&:hover': { color: '#a1a1aa' },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: '#71717a',
    fontSize: '0.875rem',
  }),
};

/**
 * Searchable field-type selector built on react-select.
 *
 * Props:
 *   value        – current type string (e.g. "text", "relation")
 *   onChange     – (typeString) => void
 *   options      – array of { type, label? } objects (FieldTypeDef) or plain { value, label }
 *   isLoading    – show loading state while types are being fetched
 *   isDisabled   – disable the control
 *   placeholder  – placeholder text
 */
export function FieldTypeSelector({
  value,
  onChange,
  options = [],
  isLoading = false,
  isDisabled = false,
  placeholder = 'Select type…',
}) {
  // Accept either FieldTypeDef ({ type, label? }) or plain { value, label } shapes.
  const normalised = options
    .map((o) => ({
      value: o.value ?? o.type,
      label: o.label ?? formatLabel(o.value ?? o.type ?? ''),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const selected = normalised.find((o) => o.value === value) ?? null;

  return (
    <ReactSelect
      value={selected}
      onChange={(opt) => opt && onChange(opt.value)}
      options={normalised}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isSearchable
      placeholder={placeholder}
      styles={darkStyles}
      menuPosition="fixed"
      noOptionsMessage={() => 'No match'}
    />
  );
}

function formatLabel(type) {
  return type
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
