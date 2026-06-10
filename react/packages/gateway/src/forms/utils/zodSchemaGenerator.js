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
export const generateFieldSchema = (fieldName, fieldConfig = {}, options = {}) => {
  if (fieldConfig.hidden) {
    return null;
  }

  // has_many is a UI-only relationship manager — children store the FK back to
  // the parent, so nothing is saved on the parent record itself.
  if (fieldConfig.type === 'has_many' || fieldConfig.type === 'has-many') {
    return null;
  }

  let fieldSchema;

  const cast = options.cast;
  const configType = fieldConfig.type;

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
      fieldSchema = fieldSchema.refine((val) => val === true, {
        message: `${fieldConfig.label || fieldName} is required`,
      });
    } else if (configType === 'email' || fieldName.includes('email')) {
      fieldSchema = z.string().min(1, `${fieldConfig.label || fieldName} is required`).email('Invalid email address');
    } else if (configType === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link')) {
      fieldSchema = z.string().min(1, `${fieldConfig.label || fieldName} is required`).url('Invalid URL format');
    } else {
      fieldSchema = fieldSchema.min(1, `${fieldConfig.label || fieldName} is required`);
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
    fieldSchema = fieldSchema.min(fieldConfig.minLength,
      `Minimum ${fieldConfig.minLength} characters required`);
  }
  if (fieldConfig.maxLength && typeof fieldSchema._def.typeName === 'string') {
    fieldSchema = fieldSchema.max(fieldConfig.maxLength,
      `Maximum ${fieldConfig.maxLength} characters allowed`);
  }

  // Add min/max for numbers
  if (fieldConfig.min !== undefined && (configType === 'number' || configType === 'range' || cast === 'integer' || cast === 'int' || cast === 'float' || cast === 'double' || cast === 'decimal')) {
    fieldSchema = fieldSchema.min(fieldConfig.min,
      `Minimum value is ${fieldConfig.min}`);
  }
  if (fieldConfig.max !== undefined && (configType === 'number' || configType === 'range' || cast === 'integer' || cast === 'int' || cast === 'float' || cast === 'double' || cast === 'decimal')) {
    fieldSchema = fieldSchema.max(fieldConfig.max,
      `Maximum value is ${fieldConfig.max}`);
  }

  // Add pattern validation for strings
  if (fieldConfig.pattern) {
    fieldSchema = fieldSchema.regex(new RegExp(fieldConfig.pattern),
      fieldConfig.patternMessage || 'Invalid format');
  }

  // Add enum validation for select fields
  if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
    const values = fieldConfig.options.map(opt =>
      typeof opt === 'string' ? opt : opt.value
    );
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
export const generateZodSchema = (collection) => {
  const fields = collection?.fields;
  if (!fields) {
    return z.object({});
  }

  const casts = collection.casts || {};

  // When fillable is present, use it as a filter. Otherwise treat all fields
  // as fillable — the field config's existence is sufficient authority.
  const fillable = collection.fillable;

  const schemaShape = {};

  // Support both object-keyed fields ({ name: config }) and arrays ([{ name, ...config }])
  const entries = Array.isArray(fields)
    ? fields.map(f => [f.name, f])
    : Object.entries(fields);

  entries.forEach(([fieldName, fieldConfig]) => {
    if (!fieldName) return;

    // If fillable list exists, honour it as a filter
    if (fillable && Array.isArray(fillable) && !fillable.includes(fieldName)) {
      return;
    }

    const schema = generateFieldSchema(fieldName, fieldConfig, {
      cast: casts[fieldName],
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
export const generateZodSchemaFromFields = (fields, casts = {}) => {
  if (!fields || !Array.isArray(fields)) {
    return z.object({});
  }

  const schemaShape = {};

  fields.forEach((fieldConfig) => {
    const fieldName = fieldConfig.name;
    if (!fieldName) return;

    const schema = generateFieldSchema(fieldName, fieldConfig, {
      cast: casts[fieldName],
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
export const getFieldLabel = (fieldName, fieldConfig = {}) => {
  return fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
