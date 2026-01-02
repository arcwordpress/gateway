import React, { useRef, useEffect } from 'react';
import { useGatewayForm } from '../../utils/gatewayFormContext';
import './style.css';

function Field({
  config = {},
  name,
  children,
  fieldControl
}) {
  const labelRef = useRef(null);
  const helpRef = useRef(null);
  const headerRef = useRef(null);
  const bodyRef = useRef(null);
  const controlRef = useRef(null);
  const footerRef = useRef(null);
  const instructionsRef = useRef(null);

  const { registerFieldRefs, unregisterFieldRefs } = useGatewayForm();

  useEffect(() => {
    if (config.name) {
      registerFieldRefs(config.name, {
        label: labelRef,
        help: helpRef,
        header: headerRef,
        body: bodyRef,
        control: controlRef,
        footer: footerRef,
        instructions: instructionsRef
      });

      return () => {
        unregisterFieldRefs(config.name);
      };
    }
  }, [config.name, registerFieldRefs, unregisterFieldRefs]);

  // Render a consumer composition if children are provided.
  if (children) {
    return (
      <div className="field">
        {children}
      </div>
    );
  }

  return (
    <div className="field">
      <Field.Header innerRef={headerRef}>
        {config.label && <Field.Label label={config.label} innerRef={labelRef} />}
        {config.help && <Field.Help help={config.help} innerRef={helpRef} />}
      </Field.Header>
      <Field.Body innerRef={bodyRef}>
        <Field.Control fieldControl={fieldControl} innerRef={controlRef} />
      </Field.Body>
      <Field.Footer innerRef={footerRef}>
        {config.instructions && <Field.Instructions instructions={config.instructions} innerRef={instructionsRef} />}
      </Field.Footer>
    </div>
  );
}

Field.Label = function Label({ label, innerRef }) {
  if (!label) return null;
  return (
    <label ref={innerRef} className="field__label">{label}</label>
  );
};

Field.Help = function Help({ help, innerRef }) {
  if (!help) return null;
  return (
    <div ref={innerRef} className="field__help">{help}</div>
  );
};

Field.Header = function Header({ children, innerRef }) {
  if (!children) return null;
  return (
    <div ref={innerRef} className="field__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {children}
    </div>
  );
};

Field.Body = function Body({ children, innerRef }) {
  return <div ref={innerRef} className="field__body">{children}</div>;
};

Field.Control = function Control({ fieldControl, innerRef }) {
  if (!fieldControl || (typeof fieldControl !== 'object' && typeof fieldControl !== 'function')) {
    return null;
  }
  if (React.isValidElement(fieldControl)) {
    return <div ref={innerRef} className="field__control">{fieldControl}</div>;
  }
  if (typeof fieldControl === 'function') {
    return <div ref={innerRef} className="field__control">{fieldControl()}</div>;
  }
  return null;
};

Field.Footer = function Footer({ children, innerRef }) {
  if (!children) return null;
  return <div ref={innerRef} className="field__footer">{children}</div>;
};

Field.Instructions = function Instructions({ instructions, innerRef }) {
  if (!instructions) return null;
  return (
    <div ref={innerRef} className="field__instructions">{instructions}</div>
  );
};

export default Field;
