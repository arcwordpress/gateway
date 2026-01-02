# Field Refs Pattern

## Overview

This document describes the Field refs pattern used in the Gateway Forms package. This pattern allows consumers to access DOM element references for Field sub-components through context, without requiring manual ref passing or complex callback logic.

## Architecture

### 1. Context Structure

The `GatewayFormContext` includes a `refs` object with a `fields` property:

```javascript
refs: {
  fields: {
    [fieldName]: {
      label: RefObject,
      help: RefObject,
      header: RefObject,
      body: RefObject,
      control: RefObject,
      footer: RefObject,
      instructions: RefObject
    }
  }
}
```

### 2. Context Methods

Two methods manage field ref registration:

- `registerFieldRefs(fieldName, fieldRefsObject)` - Called when a Field component mounts
- `unregisterFieldRefs(fieldName)` - Called when a Field component unmounts

### 3. Field Component Implementation

The Field component:

1. Creates internal `useRef()` objects for each sub-component
2. Uses `useEffect` to register these refs with the context on mount
3. Automatically unregisters on unmount
4. Passes `innerRef` props to sub-components, which attach them to DOM elements
5. Requires a `name` prop to identify the field in the registry

```javascript
function Field({ config = {}, name, children, fieldControl }) {
  const labelRef = useRef(null);
  const helpRef = useRef(null);
  // ... other refs

  const { registerFieldRefs, unregisterFieldRefs } = useGatewayForm();

  useEffect(() => {
    if (name) {
      registerFieldRefs(name, {
        label: labelRef,
        help: helpRef,
        header: headerRef,
        body: bodyRef,
        control: controlRef,
        footer: footerRef,
        instructions: instructionsRef
      });

      return () => {
        unregisterFieldRefs(name);
      };
    }
  }, [name, registerFieldRefs, unregisterFieldRefs]);

  // ... render
}
```

### 4. Sub-Component Implementation

Each sub-component receives an `innerRef` prop and attaches it to its DOM element:

```javascript
Field.Label = function Label({ label, innerRef }) {
  if (!label) return null;
  return (
    <label ref={innerRef} className="field__label">{label}</label>
  );
};
```

## Consumer Usage

Consumers access refs through the context hook:

```javascript
function MyForm() {
  const { refs } = useGatewayForm();

  return (
    <>
      <Field name="email" config={emailConfig} fieldControl={emailInput} />
      
      <button onClick={() => {
        // Access the email field's control element
        refs.fields.email.control.focus();
      }}>
        Focus Email
      </button>
    </>
  );
}
```

## Implementation in Other Components

To implement this pattern in other components:

1. **Update the context provider** to initialize `refs` object with the structure you need
2. **Create internal refs** using `useRef()` for each sub-element
3. **Use `useEffect`** to register/unregister on mount/unmount:
   - Call `registerFieldRefs(name, refsObject)` on mount
   - Call `unregisterFieldRefs(name)` on unmount
4. **Pass `innerRef` props** to sub-components
5. **Attach refs to DOM elements** via the `ref` attribute

### Example for a Custom Component

```javascript
function CustomField({ name, config }) {
  const mainRef = useRef(null);
  const inputRef = useRef(null);
  
  const { registerFieldRefs, unregisterFieldRefs } = useGatewayForm();

  useEffect(() => {
    if (name) {
      registerFieldRefs(name, {
        main: mainRef,
        input: inputRef
      });

      return () => unregisterFieldRefs(name);
    }
  }, [name, registerFieldRefs, unregisterFieldRefs]);

  return (
    <div ref={mainRef} className="custom-field">
      <input ref={inputRef} {...config} />
    </div>
  );
}
```

## Key Design Decisions

1. **No manual ref passing** - Consumers don't need to create refs and pass them as props
2. **Automatic registration** - Fields self-register on mount and clean up on unmount
3. **Extensible structure** - The `refs` object can hold other ref groups like `refs.errors` in the future
4. **Name-based access** - Fields are identified by their `name` prop, making access intuitive
5. **No forwardRef required** - Cleaner API that doesn't expose internal Field structure to consumers

## Accessing Multiple Fields

```javascript
function MyForm() {
  const { refs } = useGatewayForm();

  const handleSubmit = () => {
    // Access multiple field controls
    const emailControl = refs.fields.email.control;
    const passwordControl = refs.fields.password.control;
    
    // Perform actions like focus, scroll, etc.
    emailControl.scrollIntoView();
  };

  return (
    <>
      <Field name="email" config={emailConfig} fieldControl={emailInput} />
      <Field name="password" config={passwordConfig} fieldControl={passwordInput} />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

## Future Extensibility

The pattern supports adding additional ref groups without breaking existing code:

```javascript
// Future: add error refs
refs: {
  fields: { /* existing */ },
  errors: { /* new */ },
  labels: { /* new */ }
}
```

Each group can have its own registration methods while maintaining the same pattern.
