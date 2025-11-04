import { useState } from 'react';

export { default as useFilter } from './useFilter';

function useFilter(initialValue = []) {
  const [value, setValue] = useState(initialValue);

  const add = (item) => {
    setValue((prev) => [...prev, item]);
  };

  const remove = (item) => {
    setValue((prev) => prev.filter((i) => i !== item));
  };

  const clear = () => {
    setValue([]);
  };

  return { value, add, remove, clear };
}