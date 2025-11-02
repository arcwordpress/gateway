import { registerField } from '../fieldRegistry';
import { relationFieldDefinition } from '../components/field-types/RelationField';
import { textFieldDefinition } from '../components/field-types/text';
import { buttonGroupFieldDefinition } from '../components/field-types/button-group';
import { checkboxFieldDefinition } from '../components/field-types/checkbox';

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

  // Future field types - uncomment as they are implemented with Display/Input components
  // registerField(textareaFieldDefinition);
  // registerField(selectFieldDefinition);
  // registerField(checkboxFieldDefinition);
  // registerField(emailFieldDefinition);
  // registerField(markdownFieldDefinition);
  // registerField(numberFieldDefinition);
  // registerField(urlFieldDefinition);
  // registerField(passwordFieldDefinition);
  // registerField(rangeFieldDefinition);
  // registerField(radioFieldDefinition);
  // registerField(buttonGroupFieldDefinition);
  // registerField(wysiwygFieldDefinition);
  // registerField(colorPickerFieldDefinition);
  // registerField(readOnlyFieldDefinition);
  // registerField(hiddenFieldDefinition);
  // registerField(sortableChildrenFieldDefinition);
  // registerField(datePickerFieldDefinition);
  // registerField(timePickerFieldDefinition);
  // registerField(dateTimePickerFieldDefinition);
  // registerField(imageFieldDefinition);
  // registerField(fileFieldDefinition);
  // registerField(galleryFieldDefinition);
  // registerField(linkFieldDefinition);
  // registerField(oEmbedFieldDefinition);
  // registerField(postObjectFieldDefinition);
  // registerField(userFieldDefinition);
};
