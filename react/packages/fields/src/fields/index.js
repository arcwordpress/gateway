import { registerField } from '../fieldRegistry';
import { relationFieldDefinition } from '../components/field-types/RelationField';
import { textFieldDefinition } from '../components/field-types/text';
import { buttonGroupFieldDefinition } from '../components/field-types/button-group';
import { checkboxFieldDefinition } from '../components/field-types/checkbox';
import { colorPickerFieldDefinition } from '../components/field-types/color-picker';
import { datePickerFieldDefinition } from '../components/field-types/date-picker';
import { dateTimePickerFieldDefinition } from '../components/field-types/datetime-picker';
import { emailFieldDefinition } from '../components/field-types/email';
import { fileFieldDefinition } from '../components/field-types/file';
import { galleryFieldDefinition } from '../components/field-types/gallery';
import { hiddenFieldDefinition } from '../components/field-types/hidden';
import { imageFieldDefinition } from '../components/field-types/image';
import { linkFieldDefinition } from '../components/field-types/link';
import { markdownFieldDefinition } from '../components/field-types/markdown';
import { numberFieldDefinition } from '../components/field-types/number';
import { oembedFieldDefinition } from '../components/field-types/oembed';
import { passwordFieldDefinition } from '../components/field-types/password';
import { postObjectFieldDefinition } from '../components/field-types/post-object';
import { radioFieldDefinition } from '../components/field-types/radio';
import { rangeFieldDefinition } from '../components/field-types/range';
import { readonlyFieldDefinition } from '../components/field-types/readonly';
import { selectFieldDefinition } from '../components/field-types/select';
import { sortableChildrenFieldDefinition } from '../components/field-types/sortable-children';

/**
 * Initialize all field types in the registry
 * This must be called before any field components are used
 */
export const initializeFields = () => {
  
  // Register Relation field
  registerField(relationFieldDefinition);

  // Register Text field
  registerField(textFieldDefinition);

  // Register Button Group field
  registerField(buttonGroupFieldDefinition);

  // Register Checkbox field
  registerField(checkboxFieldDefinition);

  // Register Color Picker field
  registerField(colorPickerFieldDefinition);

  // Register Date Picker field
  registerField(datePickerFieldDefinition);

  // Register DateTime Picker field
  registerField(dateTimePickerFieldDefinition);

  // Register Email field
  registerField(emailFieldDefinition);

  // Register File field
  registerField(fileFieldDefinition);

  // Register Gallery field
  registerField(galleryFieldDefinition);

  // Register Hidden field
  registerField(hiddenFieldDefinition);

  // Register Image field
  registerField(imageFieldDefinition);

  // Register Link field
  registerField(linkFieldDefinition);

  // Register Markdown field
  registerField(markdownFieldDefinition);

  // Register Number field
  registerField(numberFieldDefinition);

  // Register OEmbed field
  registerField(oembedFieldDefinition);

  // Register Password field
  registerField(passwordFieldDefinition);

  // Register Post Object field
  registerField(postObjectFieldDefinition);

  // Register Radio field
  registerField(radioFieldDefinition);

  // Register Range field
  registerField(rangeFieldDefinition);

  // Register Read Only field
  registerField(readonlyFieldDefinition);

  // Register Select field
  registerField(selectFieldDefinition);

  // Register Sortable Children field
  registerField(sortableChildrenFieldDefinition);

};
