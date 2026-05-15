import { getFieldTypeDisplay } from '@arcwp/gateway-forms';

/**
 * Column Generator Utility
 * Generates TanStack Table column definitions from collection metadata
 */

/**
 * Resolve the label field for a collection.
 * Returns { fieldKey: string|null, status: 'configured'|'auto'|'none' }
 * - 'configured': collection.grid.labelField is explicitly set
 * - 'auto': title or name field found in collection.fields
 * - 'none': no label field available
 */
export const getLabelField = (collection) => {
  if (!collection) return { fieldKey: null, status: 'none' };

  if (collection?.displayField && collection.displayField !== 'id') {
    return { fieldKey: collection.displayField, status: 'configured' };
  }

  if (collection?.grid?.labelField) {
    return { fieldKey: collection.grid.labelField, status: 'configured' };
  }

  // Fields may be an object keyed by name (old Gateway) or an array (Raptor).
  const fields = collection?.fields;
  const AUTO_CANDIDATES = ['title', 'name', 'label'];

  if (Array.isArray(fields)) {
    const names = fields.map((f) => f.name);
    for (const candidate of AUTO_CANDIDATES) {
      if (names.includes(candidate)) return { fieldKey: candidate, status: 'auto' };
    }
  } else if (fields && typeof fields === 'object') {
    for (const candidate of AUTO_CANDIDATES) {
      if (fields[candidate]) return { fieldKey: candidate, status: 'auto' };
    }
  }

  return { fieldKey: null, status: 'none' };
};

/**
 * Generate base columns from collection configuration
 * @param {Object} collection - Collection metadata with fields and grid config
 * @returns {Array} Array of TanStack Table column definitions
 */
export const generateColumns = (collection) => {
  if (!collection) return [];

  const MAX_DATA_COLS = 3; // ID + LABEL + 3 = 5 total visible columns

  let baseColumns = [];

  // Priority 1: Use grid.columns if defined
  if (collection?.grid?.columns && Array.isArray(collection.grid.columns)) {
    const { fieldKey: configuredLabelKey } = getLabelField(collection);
    const skipFields = new Set(['id', configuredLabelKey].filter(Boolean));
    baseColumns = collection.grid.columns
      .filter((colDef) => !skipFields.has(colDef.field))
      .slice(0, MAX_DATA_COLS)
      .map((colDef) => ({
      accessorKey: colDef.field,
      header: colDef.label || colDef.field,
      enableSorting: colDef.sortable !== false, // Default to true unless explicitly false
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const value = getValue();
        // Handle null/undefined values
        if (value === null || value === undefined) return '-';

        // Get field config for additional context
        let fieldConfig = collection?.fields?.[colDef.field];

        // If no field config found and value is an object, check for relation field with _id suffix
        // e.g., if column is "status", check for "status_id" field config
        if (!fieldConfig && typeof value === 'object' && value !== null) {
          const relationFieldKey = `${colDef.field}_id`;
          const relationFieldConfig = collection?.fields?.[relationFieldKey];
          if (relationFieldConfig && (relationFieldConfig.type === 'relation' || relationFieldConfig.type === 'relationship')) {
            fieldConfig = relationFieldConfig;
          }
        }

        // Check if this is a relation or relationship field type
        if (fieldConfig && (fieldConfig.type === 'relation' || fieldConfig.type === 'relationship')) {
          const displayType = fieldConfig.type;
          const DisplayComponent = getFieldTypeDisplay(displayType);
          const fieldRelConfig = fieldConfig[displayType] || {};
          return DisplayComponent ? <DisplayComponent value={value} config={fieldRelConfig} /> : String(value);
        }

        // Handle objects and arrays
        if (typeof value === 'object') return JSON.stringify(value);

        const stringValue = String(value);

        const isLongTextField = fieldConfig && ['textarea', 'markdown', 'wysiwyg'].includes(fieldConfig.type) ||
                                ['description', 'content', 'body', 'text', 'message', 'notes'].includes(colDef.field.toLowerCase());

        if (isLongTextField && stringValue.length > 100) {
          return (
            <span title={stringValue} className="cursor-help">
              {stringValue}
            </span>
          );
        }

        return stringValue;
      },
    }));
  }
  // Priority 2: Use collection fields (auto-generate, limited to 5)
  else if (collection?.fields && Object.keys(collection.fields).length > 0) {
    const { fieldKey: autoLabelKey } = getLabelField(collection);
    // Exclude fields that will be shown as dedicated ID/Label columns
    const skipKeys = new Set(['id', autoLabelKey].filter(Boolean));
    const fieldEntries = Object.entries(collection.fields)
      .filter(([key]) => !skipKeys.has(key))
      .slice(0, MAX_DATA_COLS);
    baseColumns = fieldEntries.map(([key, field]) => ({
      accessorKey: key,
      header: field.label || key,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) return '-';

        // Check if this is a relation or relationship field type
        if (field.type === 'relation' || field.type === 'relationship') {
          const displayType = field.type;
          const DisplayComponent = getFieldTypeDisplay(displayType);
          const fieldRelConfig = field[displayType] || {};
          return DisplayComponent ? <DisplayComponent value={value} config={fieldRelConfig} /> : String(value);
        }

        // Smart detection: if value is an object with 'id' and common label fields,
        // treat it as an eagerly-loaded relation and extract the label
        if (typeof value === 'object' && value !== null && 'id' in value) {
          const label = value.name || value.title || value.label || value.text;
          if (label !== undefined) {
            const RelationDisplay = getFieldTypeDisplay('relation');
            return RelationDisplay ? <RelationDisplay value={value} config={{}} /> : String(value);
          }
        }

        // Handle objects and arrays
        if (typeof value === 'object') return JSON.stringify(value);

        const stringValue = String(value);
        const isLongTextField = ['textarea', 'markdown', 'wysiwyg'].includes(field.type) ||
                                ['description', 'content', 'body', 'text', 'message', 'notes'].includes(key.toLowerCase());

        if (isLongTextField && stringValue.length > 100) {
          return (
            <span title={stringValue} className="cursor-help">
              {stringValue}
            </span>
          );
        }

        return stringValue;
      },
    }));
  }

  // Build the ID column (always first)
  const idColumn = {
    id: '__id',
    accessorKey: 'id',
    header: 'ID',
    enableSorting: true,
    enableColumnFilter: false,
    size: 80,
    cell: ({ getValue }) => (
      <span className="grid__id-badge">#{getValue()}</span>
    ),
  };

  // Build the Label column (always second)
  const { fieldKey: labelKey, status: labelStatus } = getLabelField(collection);

  const labelColumn = {
    id: '__label',
    accessorKey: labelKey || 'id',
    header: 'Label',
    enableSorting: !!labelKey,
    enableColumnFilter: !!labelKey,
    cell: ({ row }) => {
      if (labelStatus === 'none') {
        return (
          <span className="grid__no-label">
            No default label field set for this collection.
          </span>
        );
      }
      const value = row.original[labelKey];
      if (value === null || value === undefined || value === '') {
        return <span className="grid__no-label grid__no-label--empty">—</span>;
      }
      return String(value);
    },
  };

  return [idColumn, labelColumn, ...baseColumns];
};
