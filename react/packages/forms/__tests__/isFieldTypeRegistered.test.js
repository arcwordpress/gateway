import { isFieldTypeRegistered } from '../src/fieldTypeRegistry.js';
import { initializeFieldTypes } from '../src/index.js';

describe('isFieldTypeRegistered timing', () => {
  it('registry contains expected internals after init', () => {
    // These should always be registered after initialization
    expect(isFieldTypeRegistered('text')).toBe(true);
    expect(isFieldTypeRegistered('select')).toBe(true);
  });
});
