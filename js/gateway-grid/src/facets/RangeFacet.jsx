import { h } from 'preact';

const RangeFacet = ({ field, label, value = {}, onChange }) => (
  <div class="gty-facets__item gty-facets__item--compound">
    <span class="gty-facets__label">{label}</span>
    <div class="gty-facets__pair">
      <input
        class="gty-facets__input gty-facets__input--narrow"
        type="number"
        placeholder="Min"
        value={value.min ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, min: e.target.value })}
      />
      <span class="gty-facets__sep">–</span>
      <input
        class="gty-facets__input gty-facets__input--narrow"
        type="number"
        placeholder="Max"
        value={value.max ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, max: e.target.value })}
      />
    </div>
  </div>
);

export default RangeFacet;
