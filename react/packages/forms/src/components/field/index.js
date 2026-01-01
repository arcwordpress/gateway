import React from 'react';
import './style.css';

function Field({
  config = {},
  children,
  fieldControl
}) {
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
      <Field.Header>
        {config.label && <Field.Label label={config.label} />}
        {config.help && <Field.Help help={config.help} />}
      </Field.Header>
      <Field.Body>
        <Field.Control fieldControl={fieldControl} />
      </Field.Body>
      <Field.Footer>
        {config.instructions && <Field.Instructions instructions={config.instructions} />}
      </Field.Footer>
    </div>
  );
}

Field.Label = function Label({ label }) {
  if (!label) return null;
  return (
    <label className="field__label">{label}</label>
  );
};

Field.Help = function Help({ help }) {
  if (!help) return null;
  return (
    <div className="field__help">{help}</div>
  );
};

Field.Header = function Header({ children }) {
  if (!children) return null;
  return (
    <div className="field__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {children}
    </div>
  );
};

Field.Body = function Body({ children }) {
  return <div className="field__body">{children}</div>;
};

Field.Control = function Control({ fieldControl }) {
  if (!fieldControl || (typeof fieldControl !== 'object' && typeof fieldControl !== 'function')) {
    return null;
  }
  if (React.isValidElement(fieldControl)) {
    return <div className="field__control">{fieldControl}</div>;
  }
  if (typeof fieldControl === 'function') {
    return <div className="field__control">{fieldControl()}</div>;
  }
  return null;
};

Field.Footer = function Footer({ children }) {
  if (!children) return null;
  return <div className="field__footer">{children}</div>;
};

Field.Instructions = function Instructions({ instructions }) {
  if (!instructions) return null;
  return (
    <div className="field__instructions">{instructions}</div>
  );
};

export default Field;
