/**
 * BlockForm - Gutenberg block inspector control wrapper
 *
 * Thin wrapper around ControlledForm that maps Gutenberg's attributes/setAttributes
 * pattern to the generic values/onChange interface.
 *
 * @param {Object}   props.attributes    - Gutenberg block attributes
 * @param {Function} props.setAttributes - Gutenberg setAttributes function
 * @param {Array}    [props.fields]      - Optional field config array for auto-rendering
 * @param {boolean}  [props.validate]    - Enable Zod validation (default false)
 * @param {Object}   [props.collection]  - Optional collection object for validation/metadata
 * @param {React.ReactNode} [props.children] - Custom layout inside the form context
 *
 * @example
 * // Auto-render fields
 * <BlockForm
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 *   fields={[
 *     { type: 'text', name: 'title', label: 'Title' },
 *     { type: 'select', name: 'layout', label: 'Layout', options: [...] },
 *   ]}
 * />
 *
 * @example
 * // Custom layout with children
 * <BlockForm attributes={attributes} setAttributes={setAttributes}>
 *   <PanelBody title="Settings">
 *     <GutenbergField config={titleConfig} attributes={attributes} />
 *   </PanelBody>
 * </BlockForm>
 */

import { useCallback } from 'react';
import { ControlledForm } from './ControlledForm';

const BlockForm = ({ attributes, setAttributes, fields, validate, collection, children }) => {
  const handleChange = useCallback(
    (name, value) => {
      setAttributes({ [name]: value });
    },
    [setAttributes]
  );

  return (
    <ControlledForm
      values={attributes}
      onChange={handleChange}
      fields={fields}
      validate={validate}
      collection={collection}
    >
      {children}
    </ControlledForm>
  );
};

export { BlockForm };
