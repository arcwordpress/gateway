import { h } from 'preact';

const CheckboxFacet = ({ field, label, value, onChange }) => (
  <div class="gbd-facets__item">
    <label class="gbd-facets__label gbd-facets__label--checkbox" for={`gbd-facet-${field}`}>
      <input
        id={`gbd-facet-${field}`}
        class="gbd-facets__checkbox"
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange && onChange(field, e.target.checked)}
      />
      {label}
    </label>
  </div>
);

export default CheckboxFacet;
