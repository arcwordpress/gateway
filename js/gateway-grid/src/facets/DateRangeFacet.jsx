import { h } from 'preact';

const DateRangeFacet = ({ field, label, value = {}, onChange }) => (
  <div class="gbd-facets__item gbd-facets__item--compound">
    <span class="gbd-facets__label">{label}</span>
    <div class="gbd-facets__pair">
      <input
        class="gbd-facets__input gbd-facets__input--date"
        type="date"
        value={value.start ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, start: e.target.value })}
      />
      <span class="gbd-facets__sep">–</span>
      <input
        class="gbd-facets__input gbd-facets__input--date"
        type="date"
        value={value.end ?? ''}
        onInput={(e) => onChange && onChange(field, { ...value, end: e.target.value })}
      />
    </div>
  </div>
);

export default DateRangeFacet;
