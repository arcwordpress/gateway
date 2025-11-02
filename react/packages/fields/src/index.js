// Field type components (legacy - not yet in registry)
export { default as SelectField } from './components/field-types/SelectField';
export { default as TextareaField } from './components/field-types/TextareaField';
export { default as MarkdownField } from './components/field-types/MarkdownField';
export { default as NumberField } from './components/field-types/NumberField';
export { default as URLField } from './components/field-types/URLField';
export { default as PasswordField } from './components/field-types/PasswordField';
export { default as RangeField } from './components/field-types/RangeField';
export { default as RadioField } from './components/field-types/RadioField';
export { default as WysiwygField } from './components/field-types/WysiwygField';
export { default as ReadOnlyField } from './components/field-types/ReadOnlyField';
export { default as SortableChildrenField } from './components/field-types/SortableChildrenField';
export { default as TimePickerField } from './components/field-types/TimePickerField';
export { default as OEmbedField } from './components/field-types/OEmbedField';
export { default as PostObjectField } from './components/field-types/PostObjectField';
export { default as UserField } from './components/field-types/UserField';

// Field types namespace export for convenient access
export * as fieldTypes from './components/field-types';

// Field Registry System
export {
  registerField,
  getFieldDefinition,
  getRegisteredFieldTypes,
  isFieldTypeRegistered,
  useField,
  getFieldDisplay,
  getFieldInput,
  clearFieldRegistry,
} from './fieldRegistry';

// Field Initialization
export { initializeFields } from './fields';

// Export specific field definitions and display components
export {
  RelationFieldDisplay,
  relationFieldDefinition,
  useRelationField,
} from './components/field-types/RelationField';

export {
  TextFieldDisplay,
  textFieldDefinition,
  useTextField,
} from './components/field-types/text';

export {
  ButtonGroupFieldDisplay,
  buttonGroupFieldDefinition,
  useButtonGroupField,
} from './components/field-types/button-group';

export {
  CheckboxFieldDisplay,
  checkboxFieldDefinition,
  useCheckboxField,
} from './components/field-types/checkbox';

export {
  ColorPickerFieldDisplay,
  colorPickerFieldDefinition,
  useColorPickerField,
} from './components/field-types/color-picker';

export {
  DatePickerFieldDisplay,
  datePickerFieldDefinition,
  useDatePickerField,
} from './components/field-types/date-picker';

export {
  DateTimePickerFieldDisplay,
  dateTimePickerFieldDefinition,
  useDateTimePickerField,
} from './components/field-types/datetime-picker';

export {
  EmailFieldDisplay,
  emailFieldDefinition,
  useEmailField,
} from './components/field-types/email';

export {
  FileFieldDisplay,
  fileFieldDefinition,
  useFileField,
} from './components/field-types/file';

export {
  GalleryFieldDisplay,
  galleryFieldDefinition,
  useGalleryField,
} from './components/field-types/gallery';

export {
  HiddenFieldDisplay,
  hiddenFieldDefinition,
  useHiddenField,
} from './components/field-types/hidden';

export {
  ImageFieldDisplay,
  imageFieldDefinition,
  useImageField,
} from './components/field-types/image';

export {
  LinkFieldDisplay,
  linkFieldDefinition,
  useLinkField,
} from './components/field-types/link';
