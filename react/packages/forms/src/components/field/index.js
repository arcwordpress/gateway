import React from 'react';
import './style.css';

// Core Field container (forwardRef)
export const Field = React.forwardRef(function Field({ children, className, ...props }, ref) {
  return (
    <div className={`field ${className || ''}`.trim()} ref={ref} {...props}>
      {children}
    </div>
  );
});

Field.Label = function Label({ children = 'Field Label', labelRef, className, ...props }) {
  return (
    <label className={`field__label ${className || ''}`.trim()} ref={labelRef} {...props}>
      {children}
    </label>
  );
};

Field.Help = function Help({ helpRef, className, ...props }) {
  // simple help icon uses currentColor for easy theming
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`field__help-icon ${className || ''}`.trim()}
      ref={helpRef}
      aria-hidden="true"
      {...props}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <text x="10" y="15" textAnchor="middle" fontSize="14" fill="currentColor" fontFamily="sans-serif">?</text>
    </svg>
  );
};

Field.Instructions = function Instructions({ children = 'These are instructions for the field.', instructionsRef, className, ...props }) {
  return (
    <div className={`field__instructions ${className || ''}`.trim()} ref={instructionsRef} {...props}>
      {children}
    </div>
  );
};

Field.Control = function Control({ controlRef, type = 'text', className, ...props }) {
  if (type === 'textarea') {
    return (
      <textarea
        className={`field__control field__control--textarea ${className || ''}`.trim()}
        placeholder={props.placeholder || ''}
        ref={controlRef}
        {...props}
      />
    );
  }

  return (
    <input
      className={`field__control field__control--input ${className || ''}`.trim()}
      type={type}
      placeholder={props.placeholder || ''}
      ref={controlRef}
      {...props}
    />
  );
};

export default Field;
