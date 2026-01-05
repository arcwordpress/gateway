import React, { useRef, useState, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  if (!help) return null;

  const toggle = () => setIsOpen(prev => !prev);

  const handleClickOutside = (e) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={innerRef} className="field__help" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Show help"
        className="field__help-icon"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 0C7.1632 0 0 7.16373 0 16C0 24.8363 7.1632 32 16 32C24.8363 32 32 24.8363 32 16C32 7.16373 24.8363 0 16 0ZM18.4331 26.0581C18.4331 26.3531 18.1947 26.5915 17.8997 26.5915H14.2811C13.9867 26.5915 13.7477 26.3531 13.7477 26.0581V22.5611C13.7477 22.2661 13.9867 22.0277 14.2811 22.0277H17.8997C18.1947 22.0277 18.4331 22.2661 18.4331 22.5611V26.0581ZM21.784 14.0763C21.4459 14.5595 20.8341 15.1429 19.9136 15.8597L19.0581 16.5253C18.6741 16.8235 18.4293 17.1541 18.3088 17.5371C18.2539 17.7083 18.1867 18.0683 18.1771 18.8101C18.1728 19.1019 17.9355 19.336 17.6437 19.336H14.3659C14.2213 19.336 14.0827 19.2773 13.9819 19.1728C13.8816 19.0688 13.8277 18.9285 13.8325 18.784C13.8832 17.3461 14.0224 16.3632 14.2576 15.7781C14.5045 15.1637 15.0875 14.504 16.0384 13.7611L16.9296 13.064C17.168 12.8864 17.3627 12.6885 17.5157 12.4667C17.7723 12.1099 17.8976 11.7333 17.8976 11.3152C17.8976 10.8107 17.7536 10.3637 17.4581 9.94827C17.208 9.59573 16.6949 9.41707 15.9333 9.41707C15.1899 9.41707 14.688 9.64 14.3989 10.0976C14.0608 10.6368 13.8965 11.1771 13.8965 11.7499C13.8965 12.0443 13.6576 12.2832 13.3632 12.2832H9.86667C9.7216 12.2832 9.5824 12.224 9.4816 12.1189C9.38133 12.0144 9.32747 11.8731 9.33387 11.7275C9.43733 9.25653 10.3301 7.4688 11.9856 6.4144C13.0203 5.74827 14.2981 5.41067 15.7824 5.41067C17.7083 5.41067 19.3413 5.88427 20.6368 6.8176C21.984 7.78987 22.6672 9.23787 22.6672 11.1211C22.6667 12.2784 22.3675 13.2757 21.784 14.0763Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="field__help-popover"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            background: '#333',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            maxWidth: '300px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'normal',
          }}
          role="tooltip"
        >
          {help}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #333',
            }}
          />
        </div>
      )}
    </div>
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
