// Note: API functions in './services/api' are for internal use only and are not exported from the main package API.

// Form type component exports.
export { Form } from './components/form-types/Form';
export { AppForm } from './components/form-types/AppForm';
// ComposedForm is AppForm re-exported under a semantic name for custom-layout use cases.
export { AppForm as ComposedForm } from './components/form-types/AppForm';
export { ControlledForm } from './components/form-types/ControlledForm';
export { BlockForm } from './components/form-types/BlockForm';

// Context and services exports.
export {
  useGatewayForm,
  useGatewayFormField,
  createGatewayFormContext,
  GatewayFormContext
} from './utils/gatewayFormContext';

// Field registration abstraction exports.
export {
  createFieldRegister,
  createMockFormState,
  createGutenbergRegister,
  createControlledRegister
} from './utils/fieldRegistration';

// @TODO: Refactor to remove getFieldLabel from zodSchemaGenerator and move to a more appropriate utility module.
export { generateZodSchema, generateZodSchemaFromFields, generateFieldSchema, getFieldLabel } from './utils/zodSchemaGenerator';

// Field Registry System
export {
  registerFieldType,
  getFieldTypeDefinition,
  getRegisteredFieldTypes,
  isFieldTypeRegistered,
  useFieldType,
  getFieldTypeDisplay,
  getFieldTypeInput,
} from './fieldTypeRegistry';

// Gutenberg Block Adapter
export {
  GutenbergFieldProvider,
  GutenbergField,
  GutenbergFieldGroup,
  useGutenbergField,
  useGutenbergFieldWithContext
} from './adapters/gutenbergFieldAdapter';

// Composed form hook — use inside ComposedForm/AppForm to get auto-saving field components by name.
export { useField } from './useField';

// Field type exports.
export { useRelationField } from './components/field-types/relation';
export { useTextField } from './components/field-types/text';
export { useButtonGroupField } from './components/field-types/button-group';
export { useCheckboxField } from './components/field-types/checkbox';
export { useColorPickerField } from './components/field-types/color-picker';
export { useDatePickerField } from './components/field-types/date-picker';
export { useDateTimePickerField } from './components/field-types/datetime-picker';
export { useEmailField } from './components/field-types/email';
export { useFileField } from './components/field-types/file';
export { useGalleryField } from './components/field-types/gallery';
export { useHiddenField } from './components/field-types/hidden';
export { useImageField } from './components/field-types/image';
export { useLinkField } from './components/field-types/link';
export { useMarkdownField } from './components/field-types/markdown';
export { useNumberField } from './components/field-types/number';
export { useOEmbedField } from './components/field-types/oembed';
export { usePasswordField } from './components/field-types/password';
export { usePostObjectField } from './components/field-types/post-object';
export { useRadioField } from './components/field-types/radio';
export { useRangeField } from './components/field-types/range';
export { useReadOnlyField } from './components/field-types/readonly';
export { useSelectField } from './components/field-types/select';
export { useTextareaField } from './components/field-types/textarea';
export { useTimePickerField } from './components/field-types/time-picker';
export { useUrlField } from './components/field-types/url';
export { useUserField } from './components/field-types/user';
export { useWysiwygField } from './components/field-types/wysiwyg';

// Initialize field types when the package is imported.
import { initializeFieldTypes } from './registerInternalFieldTypes';
initializeFieldTypes();
