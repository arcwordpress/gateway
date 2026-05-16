import { h } from 'preact';

const SelectFacet = ({ field, label, value, options = [], onChange }) => (
  <div class="gbd-facets__item">
    <label class="gbd-facets__label" for={`gbd-facet-${field}`}>{label}</label>
    <select
      id={`gbd-facet-${field}`}
      class="gbd-facets__select"
      value={value || ''}
      onChange={(e) => onChange && onChange(field, e.target.value)}
    >
      <option value="">All</option>
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? (opt.label ?? opt.value) : opt;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

export default SelectFacet;
