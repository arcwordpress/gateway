/**
 * Column Generator Utility
 * Generates TanStack Table column definitions from collection metadata
 */

/**
 * Generate base columns from collection configuration
 * @param {Object} collection - Collection metadata with fields and grid config
 * @returns {Array} Array of TanStack Table column definitions
 */
export const generateColumns = (collection) => {
  if (!collection) return [];

  let baseColumns = [];

  // Priority 1: Use grid.columns if defined
  if (collection?.grid?.columns && Array.isArray(collection.grid.columns)) {
    baseColumns = collection.grid.columns.map((colDef) => ({
      accessorKey: colDef.field,
      header: colDef.label || colDef.field,
      enableSorting: colDef.sortable !== false, // Default to true unless explicitly false
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const value = getValue();
        // Handle null/undefined values
        if (value === null || value === undefined) return '-';
        // Handle objects and arrays
        if (typeof value === 'object') return JSON.stringify(value);

        const stringValue = String(value);

        // Get field config for additional context
        const fieldConfig = collection?.fields?.[colDef.field];
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
    const fieldEntries = Object.entries(collection.fields).slice(0, 5); // Limit to first 5
    baseColumns = fieldEntries.map(([key, field]) => ({
      accessorKey: key,
      header: field.label || key,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) return '-';
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

  return baseColumns;
};
