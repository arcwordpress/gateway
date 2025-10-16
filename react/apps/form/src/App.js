import { useState, useEffect } from '@wordpress/element';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSchema, createRecord, getRecord, updateRecord } from './services/api';
import { SelectField, TextField, TextareaField, CheckboxField, EmailField, MarkdownField, RelationField, NumberField, URLField, PasswordField, RangeField, RadioField, ButtonGroupField, WysiwygField, ColorPickerField, ReadOnlyField, HiddenField, SortableChildrenField, DatePickerField, TimePickerField, DateTimePickerField, ImageField, FileField, GalleryField, LinkField, OEmbedField, PostObjectField, UserField } from './components/field-types';
import { generateZodSchema } from './utils/zodSchemaGenerator';

const App = ({ schemaKey, recordId }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationSchema, setValidationSchema] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  useEffect(() => {
    if (schemaKey) {
      loadSchema();
    }
  }, [schemaKey]);

  useEffect(() => {
    if (recordId && schema) {
      loadRecord();
    }
  }, [recordId, schema]);

  const loadSchema = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSchema(schemaKey);
      console.log('Schema response:', response);
      setSchema(response.data);

      // Generate Zod validation schema
      const zodSchema = generateZodSchema(response.data);
      setValidationSchema(zodSchema);
      console.log('Zod schema generated:', zodSchema);
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `Schema "${schemaKey}" not found`
        : err.message || 'Failed to load schema';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecord(schema.collection.routes.endpoint, recordId);
      console.log('Record loaded:', response);

      // Populate form with existing data
      if (response.data) {
        reset(response.data);
        setIsEditMode(true);
      }
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `Record #${recordId} not found`
        : err.message || 'Failed to load record';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!schema?.collection?.routes?.endpoint) {
      setError('No endpoint available for submission');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      let response;
      if (isEditMode && recordId) {
        response = await updateRecord(schema.collection.routes.endpoint, recordId, data);
        setSuccess('Record updated successfully!');
      } else {
        response = await createRecord(schema.collection.routes.endpoint, data);
        setSuccess('Record created successfully!');
        reset(); // Clear form only on create
      }

      console.log('Save response:', response);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save record');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInputType = (fieldName, casts = {}) => {
    // Check casts first
    if (casts[fieldName]) {
      const cast = casts[fieldName];
      if (cast === 'datetime' || cast === 'date') return 'date';
      if (cast === 'integer' || cast === 'int') return 'number';
      if (cast === 'boolean') return 'checkbox';
    }

    // Infer from field name
    if (fieldName.includes('password')) return 'password';
    if (fieldName.includes('date')) return 'date';
    if (fieldName.includes('time')) return 'time';

    return 'text';
  };

  if (!schemaKey) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No schema key provided. Add data-schema attribute.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading schema "{schemaKey}"...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!schema || !schema.collection?.model?.fillable) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Schema "{schemaKey}" loaded but has no fillable fields.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {schema.collection.model.fillable.map((fieldName) => {
            // Check if field has configuration
            const fieldConfig = schema.fields?.[fieldName] || {};

            // Skip hidden fields
            if (fieldConfig.hidden) {
              return null;
            }

            // Check if custom type is specified in config
            const configType = fieldConfig.type;
            const inputType = getInputType(fieldName, schema.collection.model.casts);
            const fieldError = errors[fieldName];

            // Render based on configured type or inferred type
            if (configType === 'sortable_children') {
              return (
                <SortableChildrenField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  recordId={recordId}
                />
              );
            }

            if (configType === 'relation') {
              return (
                <RelationField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'select') {
              return (
                <SelectField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'radio') {
              return (
                <RadioField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'button_group') {
              return (
                <ButtonGroupField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'email' || fieldName.includes('email')) {
              return (
                <EmailField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link')) {
              return (
                <URLField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'markdown') {
              return (
                <MarkdownField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'wysiwyg') {
              return (
                <WysiwygField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'textarea' || fieldName === 'description') {
              return (
                <TextareaField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (inputType === 'checkbox') {
              return (
                <CheckboxField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'number' || inputType === 'number') {
              return (
                <NumberField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'password' || inputType === 'password') {
              return (
                <PasswordField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  error={fieldError}
                />
              );
            }

            if (configType === 'range') {
              return (
                <RangeField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'color') {
              return (
                <ColorPickerField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'readonly') {
              return (
                <ReadOnlyField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                />
              );
            }

            if (configType === 'hidden') {
              return (
                <HiddenField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                />
              );
            }

            if (configType === 'date_picker') {
              return (
                <DatePickerField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'time_picker') {
              return (
                <TimePickerField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'datetime_picker') {
              return (
                <DateTimePickerField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'image') {
              return (
                <ImageField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'file') {
              return (
                <FileField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'gallery') {
              return (
                <GalleryField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'link') {
              return (
                <LinkField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'oembed') {
              return (
                <OEmbedField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'post_object') {
              return (
                <PostObjectField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            if (configType === 'user') {
              return (
                <UserField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  error={fieldError}
                />
              );
            }

            // Default to TextField
            return (
              <TextField
                key={fieldName}
                fieldName={fieldName}
                fieldConfig={fieldConfig}
                inputType={inputType}
                register={register}
                error={fieldError}
              />
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Record' : 'Create Record')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
