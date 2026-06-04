import { useRecord } from '../context/GridContext';
import { useGridContext } from '../context/GridContext';
import { getLabelField } from '../services/columnGenerator';

const humanize = (key) =>
  String(key).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === '')
    return <span style={{ color: '#52525b', fontStyle: 'italic' }}>—</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ') || <span style={{ color: '#52525b', fontStyle: 'italic' }}>—</span>;
  if (typeof value === 'object') return <span style={{ fontFamily: 'monospace', fontSize: '0.8em' }}>{JSON.stringify(value)}</span>;
  return String(value);
};

const Skeleton = ({ width = '100%', height = '0.9em', style = {} }) => (
  <span
    style={{
      display: 'inline-block',
      background: 'var(--gty-bg-hover, #27272a)',
      borderRadius: 4,
      width,
      height,
      verticalAlign: 'middle',
      ...style,
    }}
    className="single-view__skeleton"
  />
);

const SingleViewSkeleton = () => (
  <div className="single-view">
    <div className="single-view__header">
      <Skeleton width="2.5rem" height="1.2rem" />
      <Skeleton width="9rem" height="1.2rem" style={{ marginLeft: '0.5rem' }} />
    </div>
    <table className="single-view__table">
      <tbody>
        {[80, 140, 100, 60, 120].map((w, i) => (
          <tr key={i} className="single-view__row">
            <th className="single-view__th">
              <Skeleton width="5rem" />
            </th>
            <td className="single-view__td">
              <Skeleton width={`${w}px`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * SingleView — displays a single record in a field-by-field table.
 *
 * Props:
 *   record        {Object|null}  – the record data object
 *   recordId      {string|number} – record ID (used as fallback when record is null)
 *   loading       {boolean}      – show skeleton while true and record is absent
 *   fields        {Array}        – [{name, label?, type?}] from Raptor field_list
 *   labelField    {string|null}  – field name to use as the record's primary label
 *   collectionTitle {string}     – human-readable collection name shown in header
 */
const SingleView = ({
  recordId,
  record: directRecord,
  loading: propLoading = false,
  fields: propFields = [],
  labelField: propLabelField = null,
  collectionTitle = '',
}) => {
  // Inside a Grid the record may already be in context; outside (e.g. RecordView page) use directRecord.
  const contextRecord = useRecord(recordId);
  const { collection } = useGridContext();

  const record = directRecord || contextRecord;

  // Show skeleton while loading and record not yet available
  if (propLoading && !record) {
    return <SingleViewSkeleton />;
  }

  // ── Determine label field ────────────────────────────────────────────────
  // Priority: explicit Raptor label_field prop > GridContext collection.grid.labelField > auto-detect
  const { fieldKey: ctxLabelKey } = getLabelField(collection);
  const labelKey = propLabelField || ctxLabelKey || null;
  const labelValue = record && labelKey ? record[labelKey] : null;

  // ── Determine display fields ─────────────────────────────────────────────
  // Priority: Raptor propFields > GridContext collection.fields > raw record keys
  let displayFields = [];

  if (propFields && propFields.length > 0) {
    // Raptor field definitions: [{name, label, type}]
    displayFields = propFields.map((f) => ({
      name: f.name,
      label: f.label || humanize(f.name),
      type: f.type || 'text',
    }));
  } else if (collection?.fields && Object.keys(collection.fields).length > 0) {
    // Old Gateway API: collection.fields is {fieldName: {label, type, ...}}
    displayFields = Object.entries(collection.fields).map(([name, meta]) => ({
      name,
      label: (meta && meta.label) || humanize(name),
      type: (meta && meta.type) || 'text',
    }));
  } else if (record) {
    // Fallback: all record keys except id
    displayFields = Object.keys(record)
      .filter((k) => k !== 'id')
      .map((k) => ({ name: k, label: humanize(k), type: 'text' }));
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="single-view">
      {/* Header: ID badge + label value */}
      <div className="single-view__header">
        <span className="grid__id-badge">#{record?.id ?? recordId}</span>
        {labelValue != null && (
          <span className="single-view__label">{String(labelValue)}</span>
        )}
        {labelValue == null && collectionTitle && (
          <span className="single-view__label single-view__label--fallback">
            {collectionTitle} Record
          </span>
        )}
      </div>

      {/* Field table */}
      {displayFields.length > 0 ? (
        <table className="single-view__table">
          <tbody>
            {displayFields.map(({ name, label }) => (
              <tr key={name} className="single-view__row">
                <th className="single-view__th">{label}</th>
                <td className="single-view__td">
                  {record ? formatValue(record[name]) : <Skeleton width="8rem" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !record ? (
        <div className="single-view__empty">No data available for this record.</div>
      ) : (
        /* Last-resort: show all raw record fields */
        <table className="single-view__table">
          <tbody>
            {Object.entries(record)
              .filter(([k]) => k !== 'id')
              .map(([k, v]) => (
                <tr key={k} className="single-view__row">
                  <th className="single-view__th">{humanize(k)}</th>
                  <td className="single-view__td">{formatValue(v)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SingleView;
