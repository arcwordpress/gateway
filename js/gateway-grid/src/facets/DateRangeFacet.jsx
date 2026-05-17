import { h } from 'preact';

const DateRangeFacet = ({ field, label, value = {}, onChange }) => (
  <div class="gty-facets__item gty-facets__item--compound">
    <span class="gty-facets__label">{label}</span>
    <div class="gty-facets__pair">
      <input
        class="gty-facets__input gty-facets__input--date"
        type="date"
        value={value.start ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, start: e.target.value })}
      />
      <span class="gty-facets__sep">–</span>
      <input
        class="gty-facets__input gty-facets__input--date"
        type="date"
        value={value.end ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, end: e.target.value })}
      />
    </div>
  </div>
);

export default DateRangeFacet;
