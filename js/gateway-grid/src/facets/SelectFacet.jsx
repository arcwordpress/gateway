import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const toOption = (item) => {
  if (typeof item !== 'object') return { value: String(item), label: String(item) };
  return {
    value: String(item.id ?? item.value ?? ''),
    label: item.title ?? item.name ?? item.label ?? String(item.id ?? item.value ?? ''),
  };
};

const SelectFacet = ({ field, label, value, options = [], optionsEndpoint, placeholder = 'All', onChange }) => {
  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    if (!optionsEndpoint) return;
    let cancelled = false;
    fetch(optionsEndpoint)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const arr = Array.isArray(data)        ? data
          : Array.isArray(data?.data?.items)   ? data.data.items
          : Array.isArray(data?.data)          ? data.data
          : Array.isArray(data?.items)         ? data.items
          : [];
        setFetched(arr.map(toOption));
      })
      .catch(() => { if (!cancelled) setFetched([]); });
    return () => { cancelled = true; };
  }, [optionsEndpoint]);

  const resolvedOptions = fetched ?? options;

  return (
    <div class="gty-facets__item">
      <label class="gty-facets__label" for={`gty-facet-${field}`}>{label}</label>
      <select
        id={`gty-facet-${field}`}
        class="gty-facets__select"
        value={value || ''}
        onChange={(e) => onChange && onChange(field, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {resolvedOptions.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? (opt.label ?? opt.value) : opt;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
};

export default SelectFacet;
