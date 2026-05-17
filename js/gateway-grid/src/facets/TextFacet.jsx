import { h } from 'preact';

const TextFacet = ({ field, label, value, onChange }) => (
  <div class="gty-facets__item">
    <label class="gty-facets__label" for={`gty-facet-${field}`}>{label}</label>
    <input
      id={`gty-facet-${field}`}
      class="gty-facets__input"
      type="text"
      placeholder={`Filter by ${label}…`}
      value={value || ''}
      onInput={(e) => onChange && onChange(field, e.target.value)}
    />
  </div>
);

export default TextFacet;
