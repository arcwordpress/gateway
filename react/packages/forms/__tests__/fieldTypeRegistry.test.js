import { registerFieldType, getFieldTypeDefinition } from '../src/fieldTypeRegistry.js';

describe('registerFieldType', () => {
  it('registers a field type definition', () => {
    const def = { type: 'simple', Input: () => null, Display: () => null };
    registerFieldType(def);
    expect(getFieldTypeDefinition('simple')).toBe(def);
  });
});
