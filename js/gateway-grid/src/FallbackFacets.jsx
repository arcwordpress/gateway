import { h } from 'preact';
import TextFacet   from './facets/TextFacet';
import SelectFacet from './facets/SelectFacet';

const relLabel = (obj) =>
  obj?.title ?? obj?.name ?? obj?.label ?? String(obj?.id ?? obj ?? '');

const FallbackFacets = ({ records, values, onChange }) => {
  // Derive unique listing type options from already-loaded relation data
  const seen = new Map();
  for (const r of records) {
    const lt = r.listingType;
    if (!lt) continue;
    const id = String(lt?.id ?? lt);
    if (!seen.has(id)) seen.set(id, { value: id, label: relLabel(lt) });
  }
  const typeOptions = [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div class="gbd-facets">
      <TextFacet
        field="__search"
        label="Search"
        value={values?.__search}
        onChange={onChange}
      />
      {typeOptions.length > 0 && (
        <SelectFacet
          field="listingType"
          label="Listing Type"
          value={values?.listingType}
          options={typeOptions}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default FallbackFacets;
