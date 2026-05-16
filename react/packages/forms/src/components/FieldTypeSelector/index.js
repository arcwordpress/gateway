import React from 'react';
import ReactSelect from 'react-select';

// All styles are inline via the `styles` prop so WordPress admin CSS cannot
// override them. `unstyled` removes emotion-generated class styles entirely.
const darkStyles = {
  container: () => ({
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
  }),
  control: (_, state) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: '38px',
    padding: '0 8px',
    backgroundColor: '#18181b',
    border: `1px solid ${state.isFocused ? '#71717a' : '#27272a'}`,
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 1px #71717a' : 'none',
    cursor: 'default',
    boxSizing: 'border-box',
    outline: 'none',
  }),
  valueContainer: () => ({
    display: 'flex',
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '2px 0',
    overflow: 'hidden',
  }),
  singleValue: () => ({
    color: '#f4f4f5',
    fontSize: '0.875rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  placeholder: () => ({
    color: '#71717a',
    fontSize: '0.875rem',
  }),
  input: () => ({
    color: '#f4f4f5',
    fontSize: '0.875rem',
    background: 'none',
    border: 0,
    outline: 0,
    padding: 0,
    margin: 0,
  }),
  indicatorsContainer: () => ({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: () => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    color: '#71717a',
  }),
  loadingIndicator: () => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    color: '#71717a',
  }),
  menu: () => ({
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
  }),
  menuList: () => ({
    maxHeight: '220px',
    overflowY: 'auto',
    padding: '4px 0',
  }),
  option: (_, { isFocused, isSelected }) => ({
    padding: '6px 12px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#3f3f46' : isFocused ? '#27272a' : 'transparent',
    color: isSelected ? '#fff' : '#d4d4d8',
  }),
  noOptionsMessage: () => ({
    padding: '8px 12px',
    color: '#71717a',
    fontSize: '0.875rem',
  }),
  loadingMessage: () => ({
    padding: '8px 12px',
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
 *   options      – FieldTypeDef[] ({ type, label? }) or plain { value, label }[]
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
  const normalised = options
    .map((o) => ({
      value: o.value ?? o.type,
      label: o.label ?? formatLabel(o.value ?? o.type ?? ''),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const selected = normalised.find((o) => o.value === value) ?? null;

  return (
    <ReactSelect
      unstyled
      value={selected}
      onChange={(opt) => opt && onChange(opt.value)}
      options={normalised}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isSearchable
      placeholder={placeholder}
      styles={darkStyles}
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
