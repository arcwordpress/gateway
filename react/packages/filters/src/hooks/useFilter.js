import { useMemo } from 'react';
import Filter from '../components/Filter';

const useFilter = (type, config = {}) => {
  const filterConfig = useMemo(() => ({ ...config, type }), [type, config]);

  const BoundFilter = useMemo(() => {
    const WrappedFilter = (props) => (
      <Filter
        filter={filterConfig}
        {...props}
      />
    );

    WrappedFilter.displayName = `Filter(${type})`;

    return WrappedFilter;
  }, [filterConfig, type]);

  return { Filter: BoundFilter };
};

export default useFilter;