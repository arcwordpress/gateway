# Gateway Fields Architecture for Gutenberg Integration

## Problem Statement

Gateway Fields were originally designed to work exclusively with React Hook Forms (RHF), creating a hard dependency where every field component calls `useGatewayForm()` to access RHF's `register` function. This prevented fields from being used in Gutenberg blocks, where state is managed via `setAttributes` instead of RHF.

## Solution Architecture

### 1. Registration Abstraction Layer

**File:** `/src/utils/fieldRegistration.js`

Created an abstraction that wraps any registration function (RHF or custom) and returns an RHF-compatible API:

```javascript
createFieldRegister(registerFn) → (name, options) → { name, onChange, onBlur, ref }
```

**Key Features:**
- Detects RHF's register and passes it through unchanged
- Wraps custom functions (like Gutenberg's) to provide RHF-compatible API
- Handles different event types (synthetic events, custom events, direct values)
- Type-aware value extraction (checkbox, number, file, etc.)

### 2. Enhanced Context Creator

**File:** `/src/utils/gatewayFormContext.js`

Updated `createGatewayFormContext()` to accept an optional `customRegister` parameter:

```javascript
createGatewayFormContext(
  methods,           // RHF methods (can be null)
  collection,
  recordId,
  loading,
  error,
  fieldErrors,
  updatingFields,
  customRegister     // NEW: Custom register function
)
```

**Changes:**
- Uses `customRegister` if provided, otherwise falls back to RHF's `methods.register`
- Wraps the register function with `createFieldRegister()`
- Creates mock `formState` when RHF is not available
- All RHF methods are optional and may be `undefined` in non-RHF contexts

**Backward Compatibility:**
- Existing forms work without changes (customRegister defaults to null)
- All RHF methods are still spread to context when available
- Fields that use RHF-specific features still work in form context

### 3. Gutenberg Adapter

**File:** `/src/adapters/gutenbergFieldAdapter.js`

Provides three usage patterns for Gutenberg blocks:

#### Pattern A: Provider + Individual Fields (Most Flexible)

```javascript
<GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
  <PanelBody title="Settings">
    <GutenbergField config={config} attributes={attributes} />
  </PanelBody>
</GutenbergFieldProvider>
```

**Components:**
- `GutenbergFieldProvider` - Creates Gateway Form context with Gutenberg register
- `GutenbergField` - Renders individual field with automatic value binding

**When to use:**
- Complex layouts (tabs, accordions, multiple panels)
- Need semantic organization of fields
- Custom conditional rendering

#### Pattern B: Batch Rendering (Simplest)

```javascript
<GutenbergFieldGroup
  fields={[...]}
  attributes={attributes}
  setAttributes={setAttributes}
/>
```

**When to use:**
- Simple linear layouts
- Quick prototyping
- Few fields without complex organization

#### Pattern C: Direct useFieldType (Maximum Control)

```javascript
const { Input: TitleField } = useFieldType(config);

<GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
  <TitleField config={config} value={attributes.title} />
</GutenbergFieldProvider>
```

**When to use:**
- Need fine-grained control over rendering
- Custom field composition
- Advanced use cases

### 4. Data Flow

#### In React Hook Forms (Original)

```
Form Component
  └─> RHF useForm() → methods
       └─> GatewayFormContext.Provider (methods)
            └─> Field Component
                 └─> useGatewayForm() → register
                      └─> <input {...register(name)} />
                           └─> RHF manages state
```

#### In Gutenberg Blocks (New)

```
Block edit() → { attributes, setAttributes }
  └─> createGutenbergRegister(setAttributes)
       └─> GutenbergFieldProvider
            └─> createGatewayFormContext(null, ..., customRegister)
                 └─> createFieldRegister(customRegister)
                      └─> GatewayFormContext.Provider
                           └─> Field Component
                                └─> useGatewayForm() → register
                                     └─> <input {...register(name)} />
                                          └─> onChange calls setAttributes({ [name]: value })
```

## Key Design Decisions

### 1. Why Not Modify Field Components?

**Decision:** Keep field components unchanged

**Rationale:**
- Maintain backward compatibility
- Single source of truth (fields don't need to know their context)
- Easier maintenance (abstraction is in one place)
- Future contexts can be added without field changes

### 2. Why Context Provider Pattern?

**Decision:** Use provider wrapper instead of passing props

**Rationale:**
- Consistent with existing Gateway Forms architecture
- Reduces prop drilling in complex layouts
- Allows fields at any depth to access registration
- Mirrors React Hook Forms patterns developers know

### 3. Why Three Usage Patterns?

**Decision:** Provide multiple APIs (batch, individual, direct)

**Rationale:**
- Different complexity levels for different use cases
- Progressive disclosure (simple → complex)
- Maximum flexibility for advanced users
- Smooth learning curve

### 4. Why Mock FormState?

**Decision:** Create RHF-compatible formState when not using RHF

**Rationale:**
- Fields may check `formState.errors` for validation display
- Prevents null/undefined errors in field components
- Allows future validation integration
- Maintains API compatibility

## Extension Points

### Adding New Contexts

To support fields in other contexts (e.g., custom form libraries):

1. Create a custom register function:
   ```javascript
   const customRegister = (name, value) => {
     // Your state management here
   };
   ```

2. Use `createGatewayFormContext` with `customRegister`:
   ```javascript
   const contextValue = createGatewayFormContext(
     null, null, null, false, null, {}, {},
     customRegister
   );
   ```

3. Wrap components with context provider:
   ```javascript
   <GatewayFormContext.Provider value={contextValue}>
     {/* Fields here */}
   </GatewayFormContext.Provider>
   ```

### Adding Validation

For Gutenberg blocks or other contexts needing validation:

1. Create validator function
2. Pass errors to `createMockFormState(errors)`
3. Fields automatically display errors from formState

## Testing Strategy

### Unit Tests Needed

1. **fieldRegistration.js**
   - `createFieldRegister` with RHF register (pass-through)
   - `createFieldRegister` with custom function (wrapping)
   - Event handling (synthetic events, custom events, direct values)
   - Type-specific value extraction (checkbox, number, file)

2. **gatewayFormContext.js**
   - Context creation with RHF methods
   - Context creation with custom register
   - Mock formState generation
   - Backward compatibility (existing forms)

3. **gutenbergFieldAdapter.js**
   - Provider creates correct context
   - Individual field value binding
   - Batch rendering
   - Attribute updates trigger setAttributes

### Integration Tests Needed

1. **Full Form Test (RHF)**
   - Ensure existing forms still work
   - No regression in validation
   - All field types work correctly

2. **Gutenberg Block Test**
   - Field values read from attributes
   - Field changes call setAttributes
   - Multiple fields update independently
   - Complex layouts (tabs, panels) work

## Performance Considerations

### Optimization Points

1. **useMemo for context value** - Prevents unnecessary re-renders
2. **Memoized register function** - Stable reference for useEffect deps
3. **Field-level memoization** - Individual fields only re-render on their value change

### Potential Issues

1. **Many fields in block** - Consider virtualization for 50+ fields
2. **Rapid updates** - Gutenberg's setAttributes may batch poorly
3. **Complex fields** - File upload, gallery may need optimization

## Future Enhancements

### Short Term

1. Add TypeScript types for better DX
2. Create Gutenberg-specific field styling
3. Add validation hook for blocks
4. Document field-specific considerations

### Long Term

1. Extract to standalone package (@arcwp/gateway-fields-gutenberg)
2. Add field dependency management
3. Create visual field builder
4. Conditional field rendering helpers
5. Block templates with pre-configured fields

## Migration Path

### Phase 1: Foundation (Complete)
- ✅ Create abstraction layer
- ✅ Update context creator
- ✅ Build Gutenberg adapter
- ✅ Document usage patterns

### Phase 2: Validation
- Add validation integration for Gutenberg
- Create error handling patterns
- Document validation approaches

### Phase 3: Optimization
- Add field-level performance optimizations
- Create Gutenberg-specific field variants
- Optimize for large field sets

### Phase 4: Expansion
- Extract to separate package
- Add more context adapters
- Create visual tools

## Conclusion

This architecture maintains full backward compatibility while enabling Gateway Fields to work in any context that provides a registration function. The abstraction is clean, extensible, and follows React patterns developers already understand.
