import { h } from 'preact';

const CheckboxFacet = ({ field, label, value, onChange }) => (
  <div class="gty-facets__item">
    <label class="gty-facets__label gty-facets__label--checkbox" for={`gty-facet-${field}`}>
      <input
        id={`gty-facet-${field}`}
        class="gty-facets__checkbox"
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange && onChange(field, e.target.checked)}
      />
      {label}
    </label>
  </div>
);

export default CheckboxFacet;
