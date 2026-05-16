import { h } from 'preact';

const TextFacet = ({ field, label, value, onChange }) => (
  <div class="gbd-facets__item">
    <label class="gbd-facets__label" for={`gbd-facet-${field}`}>{label}</label>
    <input
      id={`gbd-facet-${field}`}
      class="gbd-facets__input"
      type="text"
      placeholder={`Filter by ${label}…`}
      value={value || ''}
      onInput={(e) => onChange && onChange(field, e.target.value)}
    />
  </div>
);

export default TextFacet;
