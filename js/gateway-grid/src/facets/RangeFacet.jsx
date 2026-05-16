import { h } from 'preact';

const RangeFacet = ({ field, label, value = {}, onChange }) => (
  <div class="gbd-facets__item gbd-facets__item--compound">
    <span class="gbd-facets__label">{label}</span>
    <div class="gbd-facets__pair">
      <input
        class="gbd-facets__input gbd-facets__input--narrow"
        type="number"
        placeholder="Min"
        value={value.min ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, min: e.target.value })}
      />
      <span class="gbd-facets__sep">–</span>
      <input
        class="gbd-facets__input gbd-facets__input--narrow"
        type="number"
        placeholder="Max"
        value={value.max ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, max: e.target.value })}
      />
    </div>
  </div>
);

export default RangeFacet;
