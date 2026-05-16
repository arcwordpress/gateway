import { h } from 'preact';
import TextFacet      from './facets/TextFacet';
import SelectFacet    from './facets/SelectFacet';
import CheckboxFacet  from './facets/CheckboxFacet';
import RangeFacet     from './facets/RangeFacet';
import DateRangeFacet from './facets/DateRangeFacet';

const TYPE_MAP = {
  text:       TextFacet,
  select:     SelectFacet,
  checkbox:   CheckboxFacet,
  range:      RangeFacet,
  date_range: DateRangeFacet,
};

const Facets = ({ facets, values, onChange }) => {
  if (!facets || facets.length === 0) return null;

  return (
    <div class="gbd-facets">
      {facets.map((facet) => {
        // PHP uses field_name / facet_type; manual definitions may use field / type
        const field   = facet.field_name || facet.field || facet.key;
        const label   = facet.label || field;
        const type    = facet.facet_type || facet.type || 'text';
        const options = facet.config?.options ?? facet.options;

        const Component = TYPE_MAP[type] ?? TextFacet;

        return (
          <Component
            key={field}
            field={field}
            label={label}
            value={values?.[field]}
            options={options}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
};

export default Facets;
