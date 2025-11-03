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

// Field Initialization (exported for advanced use cases, but auto-initialized below)
export { initializeFields } from './fields';

// Auto-initialize fields when package is imported
import { initializeFields } from './fields';
initializeFields();

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

export {
  MarkdownFieldDisplay,
  markdownFieldDefinition,
  useMarkdownField,
} from './components/field-types/markdown';

export {
  NumberFieldDisplay,
  numberFieldDefinition,
  useNumberField,
} from './components/field-types/number';

export {
  OEmbedFieldDisplay,
  oembedFieldDefinition,
  useOEmbedField,
} from './components/field-types/oembed';

export {
  PasswordFieldDisplay,
  passwordFieldDefinition,
  usePasswordField,
} from './components/field-types/password';

export {
  PostObjectFieldDisplay,
  postObjectFieldDefinition,
  usePostObjectField,
} from './components/field-types/post-object';

export {
  RadioFieldDisplay,
  radioFieldDefinition,
  useRadioField,
} from './components/field-types/radio';

export {
  RangeFieldDisplay,
  rangeFieldDefinition,
  useRangeField,
} from './components/field-types/range';

export {
  ReadOnlyFieldDisplay,
  readonlyFieldDefinition,
  useReadOnlyField,
} from './components/field-types/readonly';

export {
  SelectFieldDisplay,
  selectFieldDefinition,
  useSelectField,
} from './components/field-types/select';

export {
  SortableChildrenFieldDisplay,
  sortableChildrenFieldDefinition,
  useSortableChildrenField,
} from './components/field-types/sortable-children';

export {
  TextareaDisplay,
  textareaFieldDefinition,
  useTextareaField,
} from './components/field-types/textarea';

export {
  TimePickerDisplay,
  timePickerFieldDefinition,
  useTimePickerField,
} from './components/field-types/time-picker';

export {
  URLDisplay,
  urlFieldDefinition,
  useURLField,
} from './components/field-types/url';

export {
  UserDisplay,
  userFieldDefinition,
  useUserField,
} from './components/field-types/user';

export {
  WysiwygDisplay,
  wysiwygFieldDefinition,
  useWysiwygField,
} from './components/field-types/wysiwyg';

export * from './fieldTypeRegistry';
export { registerInternalFieldTypes } from './registerInternalFieldTypes';

// Initialize field types when the package is imported
registerInternalFieldTypes();
