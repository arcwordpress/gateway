function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { getFieldTypeDisplay } from "../../forms";

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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export var getLabelField = collection => {
  var _collection$grid;
  if (!collection) return {
    fieldKey: null,
    status: 'none'
  };
  if (collection !== null && collection !== void 0 && collection.displayField && collection.displayField !== 'id') {
    return {
      fieldKey: collection.displayField,
      status: 'configured'
    };
  }
  if (collection !== null && collection !== void 0 && (_collection$grid = collection.grid) !== null && _collection$grid !== void 0 && _collection$grid.labelField) {
    return {
      fieldKey: collection.grid.labelField,
      status: 'configured'
    };
  }

  // Fields may be an object keyed by name (old Gateway) or an array (Raptor).
  var fields = collection === null || collection === void 0 ? void 0 : collection.fields;
  var AUTO_CANDIDATES = ['title', 'name', 'label'];
  if (Array.isArray(fields)) {
    var names = fields.map(f => f.name);
    for (var candidate of AUTO_CANDIDATES) {
      if (names.includes(candidate)) return {
        fieldKey: candidate,
        status: 'auto'
      };
    }
  } else if (fields && typeof fields === 'object') {
    for (var _candidate of AUTO_CANDIDATES) {
      if (fields[_candidate]) return {
        fieldKey: _candidate,
        status: 'auto'
      };
    }
  }
  return {
    fieldKey: null,
    status: 'none'
  };
};

/**
 * Generate base columns from collection configuration
 * @param {Object} collection - Collection metadata with fields and grid config
 * @returns {Array} Array of TanStack Table column definitions
 */
export var generateColumns = collection => {
  var _collection$grid2;
  if (!collection) return [];
  var MAX_DATA_COLS = 3; // ID + LABEL + 3 = 5 total visible columns

  var baseColumns = [];

  // Priority 1: Use grid.columns if defined
  if (collection !== null && collection !== void 0 && (_collection$grid2 = collection.grid) !== null && _collection$grid2 !== void 0 && _collection$grid2.columns && Array.isArray(collection.grid.columns)) {
    var _getLabelField = getLabelField(collection),
      configuredLabelKey = _getLabelField.fieldKey;
    var skipFields = new Set(['id', configuredLabelKey].filter(Boolean));
    baseColumns = collection.grid.columns.filter(colDef => !skipFields.has(colDef.field)).slice(0, MAX_DATA_COLS).map(colDef => ({
      accessorKey: colDef.field,
      header: colDef.label || colDef.field,
      enableSorting: colDef.sortable !== false,
      // Default to true unless explicitly false
      enableColumnFilter: true,
      cell: _ref => {
        var _collection$fields;
        var getValue = _ref.getValue,
          row = _ref.row;
        var value = getValue();
        // Handle null/undefined values
        if (value === null || value === undefined) return '-';

        // Get field config for additional context
        var fieldConfig = collection === null || collection === void 0 || (_collection$fields = collection.fields) === null || _collection$fields === void 0 ? void 0 : _collection$fields[colDef.field];

        // If no field config found and value is an object, check for relation field with _id suffix
        // e.g., if column is "status", check for "status_id" field config
        if (!fieldConfig && typeof value === 'object' && value !== null) {
          var _collection$fields2;
          var relationFieldKey = "".concat(colDef.field, "_id");
          var relationFieldConfig = collection === null || collection === void 0 || (_collection$fields2 = collection.fields) === null || _collection$fields2 === void 0 ? void 0 : _collection$fields2[relationFieldKey];
          if (relationFieldConfig && (relationFieldConfig.type === 'relation' || relationFieldConfig.type === 'relationship')) {
            fieldConfig = relationFieldConfig;
          }
        }

        // Check if this is a relation or relationship field type
        if (fieldConfig && (fieldConfig.type === 'relation' || fieldConfig.type === 'relationship')) {
          var displayType = fieldConfig.type;
          var DisplayComponent = getFieldTypeDisplay(displayType);
          var fieldRelConfig = fieldConfig[displayType] || {};
          // Prefer the embedded related object from ?relations=true
          // e.g., for column 'listing_type_id', check row.original['listing_type']
          var relationObjKey = colDef.field.endsWith('_id') ? colDef.field.slice(0, -3) : colDef.field;
          var relatedObj = row.original[relationObjKey];
          var displayValue = relatedObj && typeof relatedObj === 'object' ? relatedObj : value;
          return DisplayComponent ? /*#__PURE__*/_jsx(DisplayComponent, {
            value: displayValue,
            config: fieldRelConfig
          }) : String(value);
        }

        // Handle objects and arrays
        if (typeof value === 'object') return JSON.stringify(value);
        var stringValue = String(value);
        var isLongTextField = fieldConfig && ['textarea', 'markdown', 'wysiwyg'].includes(fieldConfig.type) || ['description', 'content', 'body', 'text', 'message', 'notes'].includes(colDef.field.toLowerCase());
        if (isLongTextField && stringValue.length > 100) {
          return /*#__PURE__*/_jsx("span", {
            title: stringValue,
            className: "cursor-help",
            children: stringValue
          });
        }
        return stringValue;
      }
    }));
  }
  // Priority 2: Use collection fields (auto-generate, limited to 5)
  else if (collection !== null && collection !== void 0 && collection.fields && Object.keys(collection.fields).length > 0) {
    var _getLabelField2 = getLabelField(collection),
      autoLabelKey = _getLabelField2.fieldKey;
    // Exclude fields that will be shown as dedicated ID/Label columns
    var skipKeys = new Set(['id', autoLabelKey].filter(Boolean));
    var fieldEntries = Object.entries(collection.fields).filter(_ref2 => {
      var _ref3 = _slicedToArray(_ref2, 1),
        key = _ref3[0];
      return !skipKeys.has(key);
    }).slice(0, MAX_DATA_COLS);
    baseColumns = fieldEntries.map(_ref4 => {
      var _ref5 = _slicedToArray(_ref4, 2),
        key = _ref5[0],
        field = _ref5[1];
      return {
        accessorKey: key,
        header: field.label || key,
        enableSorting: true,
        enableColumnFilter: true,
        cell: _ref6 => {
          var getValue = _ref6.getValue,
            row = _ref6.row;
          var value = getValue();
          if (value === null || value === undefined) return '-';

          // Check if this is a relation or relationship field type
          if (field.type === 'relation' || field.type === 'relationship') {
            var displayType = field.type;
            var DisplayComponent = getFieldTypeDisplay(displayType);
            var fieldRelConfig = field[displayType] || {};
            // Prefer the embedded related object from ?relations=true
            // e.g., for key 'listing_type_id', check row.original['listing_type']
            var relationObjKey = key.endsWith('_id') ? key.slice(0, -3) : key;
            var relatedObj = row.original[relationObjKey];
            var displayValue = relatedObj && typeof relatedObj === 'object' ? relatedObj : value;
            return DisplayComponent ? /*#__PURE__*/_jsx(DisplayComponent, {
              value: displayValue,
              config: fieldRelConfig
            }) : String(value);
          }

          // Smart detection: if value is an object with 'id' and common label fields,
          // treat it as an eagerly-loaded relation and extract the label
          if (typeof value === 'object' && value !== null && 'id' in value) {
            var label = value.name || value.title || value.label || value.text;
            if (label !== undefined) {
              var RelationDisplay = getFieldTypeDisplay('relation');
              return RelationDisplay ? /*#__PURE__*/_jsx(RelationDisplay, {
                value: value,
                config: {}
              }) : String(value);
            }
          }

          // Handle objects and arrays
          if (typeof value === 'object') return JSON.stringify(value);
          var stringValue = String(value);
          var isLongTextField = ['textarea', 'markdown', 'wysiwyg'].includes(field.type) || ['description', 'content', 'body', 'text', 'message', 'notes'].includes(key.toLowerCase());
          if (isLongTextField && stringValue.length > 100) {
            return /*#__PURE__*/_jsx("span", {
              title: stringValue,
              className: "cursor-help",
              children: stringValue
            });
          }
          return stringValue;
        }
      };
    });
  }

  // Build the ID column (always first)
  var idColumn = {
    id: '__id',
    accessorKey: 'id',
    header: 'ID',
    enableSorting: true,
    enableColumnFilter: false,
    size: 80,
    cell: _ref7 => {
      var getValue = _ref7.getValue;
      return /*#__PURE__*/_jsxs("span", {
        className: "grid__id-badge",
        children: ["#", getValue()]
      });
    }
  };

  // Build the Label column (always second)
  var _getLabelField3 = getLabelField(collection),
    labelKey = _getLabelField3.fieldKey,
    labelStatus = _getLabelField3.status;
  var labelColumn = {
    id: '__label',
    accessorKey: labelKey || 'id',
    header: 'Label',
    enableSorting: !!labelKey,
    enableColumnFilter: !!labelKey,
    cell: _ref8 => {
      var row = _ref8.row;
      if (labelStatus === 'none') {
        return /*#__PURE__*/_jsx("span", {
          className: "grid__no-label",
          children: "No default label field set for this collection."
        });
      }
      var value = row.original[labelKey];
      if (value === null || value === undefined || value === '') {
        return /*#__PURE__*/_jsx("span", {
          className: "grid__no-label grid__no-label--empty",
          children: "\u2014"
        });
      }
      return String(value);
    }
  };
  return [idColumn, labelColumn, ...baseColumns];
};