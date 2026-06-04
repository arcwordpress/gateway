function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { z } from 'zod';

/**
 * Generate a Zod schema for a single field config.
 *
 * @param {string} fieldName - The field name / key
 * @param {object} fieldConfig - The field configuration object (must include `type`)
 * @param {object} [options] - Optional overrides
 * @param {string} [options.cast] - Eloquent-style cast override (e.g. 'integer', 'boolean')
 * @returns {z.ZodTypeAny|null} Zod schema for the field, or null if the field should be skipped
 */
export var generateFieldSchema = function generateFieldSchema(fieldName) {
  var fieldConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (fieldConfig.hidden) {
    return null;
  }
  var fieldSchema;
  var cast = options.cast;
  var configType = fieldConfig.type;

  // Handle different field types
  if (cast === 'boolean' || configType === 'checkbox') {
    fieldSchema = z.boolean();
  } else if (configType === 'number' || cast === 'integer' || cast === 'int') {
    fieldSchema = z.coerce.number().int();
  } else if (cast === 'float' || cast === 'double' || cast === 'decimal') {
    fieldSchema = z.coerce.number();
  } else if (cast === 'datetime' || cast === 'date') {
    fieldSchema = z.string().datetime().or(z.date());
  } else if (configType === 'email' || fieldName.includes('email')) {
    fieldSchema = z.string().email('Invalid email address').or(z.literal(''));
  } else if (configType === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link')) {
    fieldSchema = z.string().url('Invalid URL format').or(z.literal(''));
  } else if (configType === 'password' || fieldName.includes('password')) {
    fieldSchema = z.string();
  } else if (configType === 'range') {
    fieldSchema = z.coerce.number();
  } else if (configType === 'relation' || configType === 'user') {
    fieldSchema = z.coerce.number().int().positive();
  } else if (configType === 'file' || configType === 'image') {
    fieldSchema = z.coerce.number().int().positive();
  } else if (configType === 'gallery') {
    fieldSchema = z.string();
  } else if (configType === 'select' || configType === 'radio' || configType === 'button_group' || configType === 'textarea' || configType === 'markdown' || configType === 'wysiwyg' || configType === 'color') {
    fieldSchema = z.string();
  } else {
    fieldSchema = z.string();
  }

  // Apply validation rules from field config
  if (fieldConfig.required) {
    if (cast === 'boolean') {
      fieldSchema = fieldSchema.refine(val => val === true, {
        message: "".concat(fieldConfig.label || fieldName, " is required")
      });
    } else if (configType === 'email' || fieldName.includes('email')) {
      fieldSchema = z.string().min(1, "".concat(fieldConfig.label || fieldName, " is required")).email('Invalid email address');
    } else if (configType === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link')) {
      fieldSchema = z.string().min(1, "".concat(fieldConfig.label || fieldName, " is required")).url('Invalid URL format');
    } else {
      fieldSchema = fieldSchema.min(1, "".concat(fieldConfig.label || fieldName, " is required"));
    }
  } else {
    if (!(configType === 'email' || fieldName.includes('email') || configType === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link'))) {
      if (configType === 'file' || configType === 'image') {
        fieldSchema = fieldSchema.or(z.literal('')).or(z.literal(0)).optional();
      } else if (configType === 'user') {
        fieldSchema = fieldSchema.or(z.literal(0)).nullable().optional();
      } else {
        fieldSchema = fieldSchema.optional();
      }
    }
  }

  // Add min/max length for strings
  if (fieldConfig.minLength && typeof fieldSchema._def.typeName === 'string') {
    fieldSchema = fieldSchema.min(fieldConfig.minLength, "Minimum ".concat(fieldConfig.minLength, " characters required"));
  }
  if (fieldConfig.maxLength && typeof fieldSchema._def.typeName === 'string') {
    fieldSchema = fieldSchema.max(fieldConfig.maxLength, "Maximum ".concat(fieldConfig.maxLength, " characters allowed"));
  }

  // Add min/max for numbers
  if (fieldConfig.min !== undefined && (configType === 'number' || configType === 'range' || cast === 'integer' || cast === 'int' || cast === 'float' || cast === 'double' || cast === 'decimal')) {
    fieldSchema = fieldSchema.min(fieldConfig.min, "Minimum value is ".concat(fieldConfig.min));
  }
  if (fieldConfig.max !== undefined && (configType === 'number' || configType === 'range' || cast === 'integer' || cast === 'int' || cast === 'float' || cast === 'double' || cast === 'decimal')) {
    fieldSchema = fieldSchema.max(fieldConfig.max, "Maximum value is ".concat(fieldConfig.max));
  }

  // Add pattern validation for strings
  if (fieldConfig.pattern) {
    fieldSchema = fieldSchema.regex(new RegExp(fieldConfig.pattern), fieldConfig.patternMessage || 'Invalid format');
  }

  // Add enum validation for select fields
  if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
    var values = fieldConfig.options.map(opt => typeof opt === 'string' ? opt : opt.value);
    fieldSchema = z.enum(values);
    if (!fieldConfig.required) {
      fieldSchema = fieldSchema.optional();
    }
  }
  return fieldSchema;
};

/**
 * Generate a Zod schema from a collection object.
 *
 * Iterates over `collection.fields`. If `collection.fillable` is present it is
 * used as a filter (only fields that appear in fillable are included), but it
 * is not required — when absent, every entry in `fields` is treated as fillable.
 * This removes the hard dependency on the Eloquent `$fillable` concept while
 * staying backward-compatible with collection objects that still provide it.
 *
 * @param {object} collection - The collection object (needs at least `fields`)
 * @returns {z.ZodObject} Zod schema for validation
 */
export var generateZodSchema = collection => {
  var fields = collection === null || collection === void 0 ? void 0 : collection.fields;
  if (!fields) {
    return z.object({});
  }
  var casts = collection.casts || {};

  // When fillable is present, use it as a filter. Otherwise treat all fields
  // as fillable — the field config's existence is sufficient authority.
  var fillable = collection.fillable;
  var schemaShape = {};

  // Support both object-keyed fields ({ name: config }) and arrays ([{ name, ...config }])
  var entries = Array.isArray(fields) ? fields.map(f => [f.name, f]) : Object.entries(fields);
  entries.forEach(_ref => {
    var _ref2 = _slicedToArray(_ref, 2),
      fieldName = _ref2[0],
      fieldConfig = _ref2[1];
    if (!fieldName) return;

    // If fillable list exists, honour it as a filter
    if (fillable && Array.isArray(fillable) && !fillable.includes(fieldName)) {
      return;
    }
    var schema = generateFieldSchema(fieldName, fieldConfig, {
      cast: casts[fieldName]
    });
    if (schema) {
      schemaShape[fieldName] = schema;
    }
  });
  return z.object(schemaShape);
};

/**
 * Generate a Zod schema from a plain array of field config objects.
 *
 * This is the preferred entry point for contexts that don't have a collection
 * object (Gutenberg blocks, Exta builder, etc.).
 *
 * @param {Array<object>} fields - Array of field config objects, each must have `name` and `type`
 * @param {object} [casts] - Optional casts map { fieldName: castType }
 * @returns {z.ZodObject} Zod schema for validation
 */
export var generateZodSchemaFromFields = function generateZodSchemaFromFields(fields) {
  var casts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!fields || !Array.isArray(fields)) {
    return z.object({});
  }
  var schemaShape = {};
  fields.forEach(fieldConfig => {
    var fieldName = fieldConfig.name;
    if (!fieldName) return;
    var schema = generateFieldSchema(fieldName, fieldConfig, {
      cast: casts[fieldName]
    });
    if (schema) {
      schemaShape[fieldName] = schema;
    }
  });
  return z.object(schemaShape);
};

/**
 * Get a human-readable field name from a field configuration
 * @param {string} fieldName - The field name
 * @param {object} fieldConfig - The field configuration
 * @returns {string} Human-readable field name
 */
export var getFieldLabel = function getFieldLabel(fieldName) {
  var fieldConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};