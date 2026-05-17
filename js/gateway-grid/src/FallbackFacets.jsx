import { h } from 'preact';
import SelectFacet from './facets/SelectFacet';

const relLabel = (obj) =>
  obj?.title ?? obj?.name ?? obj?.label ?? String(obj?.id ?? obj ?? '');

const FallbackFacets = ({ records, values, onChange }) => {
  const seen = new Map();
  for (const r of records) {
    const lt = r.listingType;
    if (!lt) continue;
    const id = String(lt?.id ?? lt);
    if (!seen.has(id)) seen.set(id, { value: id, label: relLabel(lt) });
  }
  const typeOptions = [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));

  if (typeOptions.length === 0) return null;

  return (
    <div class="gty-facets">
      <SelectFacet
        field="listingType"
        label="Listing Type"
        value={values?.listingType}
        options={typeOptions}
        onChange={onChange}
      />
    </div>
  );
};

export default FallbackFacets;
