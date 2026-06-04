import { registerFieldType } from './fieldTypeRegistry';
import { relationFieldType } from './components/field-types/relation';
import { relationshipFieldType } from './components/field-types/relationship';
import { textFieldType } from './components/field-types/text';
import { slugFieldType } from './components/field-types/slug';
import { buttonGroupFieldType } from './components/field-types/button-group';
import { checkboxFieldType } from './components/field-types/checkbox';
import { colorPickerFieldType } from './components/field-types/color-picker';
import { datePickerFieldType } from './components/field-types/date-picker';
import { dateTimePickerFieldType } from './components/field-types/datetime-picker';
import { emailFieldType } from './components/field-types/email';
import { fileFieldType } from './components/field-types/file';
import { galleryFieldType } from './components/field-types/gallery';
import { hiddenFieldType } from './components/field-types/hidden';
import { imageFieldType } from './components/field-types/image';
import { linkFieldType } from './components/field-types/link';
import { markdownFieldType } from './components/field-types/markdown';
import { numberFieldType } from './components/field-types/number';
import { oembedFieldType } from './components/field-types/oembed';
import { passwordFieldType } from './components/field-types/password';
import { postObjectFieldType } from './components/field-types/post-object';
import { radioFieldType } from './components/field-types/radio';
import { rangeFieldType } from './components/field-types/range';
import { readonlyFieldType } from './components/field-types/readonly';
import { selectFieldType } from './components/field-types/select';
import { textareaFieldType } from './components/field-types/textarea';
import { timePickerFieldType } from './components/field-types/time-picker';
import { urlFieldType } from './components/field-types/url';
import { userFieldType } from './components/field-types/user';
import { wysiwygFieldType } from './components/field-types/wysiwyg';

// Track initialization state to prevent duplicate registrations
let isInitialized = false;

/**
 * Initialize all field types in the registry
 * Auto-called when package is imported, but can be called manually if needed
 * Safe to call multiple times - will only initialize once
 */
export const initializeFieldTypes = () => {
  // Prevent duplicate initialization
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  registerFieldType(relationFieldType);
  registerFieldType(relationshipFieldType);
  registerFieldType(textFieldType);

  // Register Slug field type
  registerFieldType(slugFieldType);

  // Register Button Group field type
  registerFieldType(buttonGroupFieldType);

  // Register Checkbox field type
  registerFieldType(checkboxFieldType);

  // Register Color Picker field type
  registerFieldType(colorPickerFieldType);

  // Register Date Picker field type
  registerFieldType(datePickerFieldType);

  // Register DateTime Picker field type
  registerFieldType(dateTimePickerFieldType);

  // Register Email field type
  registerFieldType(emailFieldType);

  // Register File field type
  registerFieldType(fileFieldType);

  // Register Gallery field type
  registerFieldType(galleryFieldType);

  // Register Hidden field type
  registerFieldType(hiddenFieldType);

  // Register Image field type
  registerFieldType(imageFieldType);

  // Register Link field type
  registerFieldType(linkFieldType);

  // Register Markdown field type
  registerFieldType(markdownFieldType);

  // Register Number field type
  registerFieldType(numberFieldType);
  registerFieldType(oembedFieldType);
  registerFieldType(passwordFieldType);
  registerFieldType(postObjectFieldType);
  registerFieldType(radioFieldType);
  registerFieldType(rangeFieldType);
  registerFieldType(readonlyFieldType);
  registerFieldType(selectFieldType);
  registerFieldType(textareaFieldType);
  registerFieldType(timePickerFieldType);
  registerFieldType(urlFieldType);
  registerFieldType(userFieldType);
  registerFieldType(wysiwygFieldType);
};
