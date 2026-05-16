import { h } from 'preact';

const Facets = ({ facets, values, onChange }) => {
  if (!facets || facets.length === 0) return null;

  return (
    <div class="gbd-facets">
      {facets.map((facet) => {
        const field = facet.field || facet.key;
        const label = facet.label || field;
        const type  = facet.type || 'text';

        if (type === 'select' && facet.options?.length) {
          return (
            <div key={field} class="gbd-facets__item">
              <label class="gbd-facets__label" for={`gbd-facet-${field}`}>{label}</label>
              <select
                id={`gbd-facet-${field}`}
                class="gbd-facets__select"
                value={values[field] || ''}
                onChange={(e) => onChange(field, e.target.value)}
              >
                <option value="">All</option>
                {facet.options.map((opt) => {
                  const val   = typeof opt === 'object' ? opt.value : opt;
                  const oLabel = typeof opt === 'object' ? opt.label : opt;
                  return <option key={val} value={val}>{oLabel}</option>;
                })}
              </select>
            </div>
          );
        }

        // Default: text search
        return (
          <div key={field} class="gbd-facets__item">
            <label class="gbd-facets__label" for={`gbd-facet-${field}`}>{label}</label>
            <input
              id={`gbd-facet-${field}`}
              class="gbd-facets__input"
              type="text"
              placeholder={`Filter by ${label}…`}
              value={values[field] || ''}
              onInput={(e) => onChange(field, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Facets;
