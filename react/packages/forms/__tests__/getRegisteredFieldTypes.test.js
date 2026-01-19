import { registerFieldType, getRegisteredFieldTypes } from '../src/fieldTypeRegistry.js';

describe('getRegisteredFieldTypes', () => {
  it('returns all registered field type identifiers', () => {
    const def1 = { type: 'foo', Input: () => null, Display: () => null };
    const def2 = { type: 'bar', Input: () => null, Display: () => null };
    registerFieldType(def1);
    registerFieldType(def2);
    const types = getRegisteredFieldTypes();
    expect(types).toEqual(expect.arrayContaining(['foo', 'bar']));
  });
});
