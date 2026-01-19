import { renderHook } from '@testing-library/react';
import { registerFieldType, useFieldType } from '../src/fieldTypeRegistry.js';

describe('useFieldType', () => {
  it('returns Input and Display components for a registered type', () => {
    const Input = () => null;
    const Display = () => null;
    const def = { type: 'custom', Input, Display };
    registerFieldType(def);
    const config = { type: 'custom', name: 'foo' };
    const { result } = renderHook(() => useFieldType(config));
    expect(result.current.Input).toBe(Input);
    expect(result.current.Display).toBe(Display);
  });

  it('throws if config is missing', () => {
    expect(() => useFieldType()).toThrow('Config object is required');
  });

  it('throws if type is missing', () => {
    expect(() => useFieldType({ name: 'foo' })).toThrow('must include "type"');
  });

  it('throws if name is missing', () => {
    expect(() => useFieldType({ type: 'custom' })).toThrow('must include "name"');
  });

  it('throws if type is not registered', () => {
    expect(() => useFieldType({ type: 'notfound', name: 'foo' })).toThrow('not registered');
  });
});
