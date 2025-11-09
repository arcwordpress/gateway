// src/components/GridFilters.js
const GridFilters = ({ filters, values, onChange, data }) => {
  const processedFilters = useMemo(() => {
    return filters.map(filter => {
      if (filter.type === 'select' && !filter.choices) {
        return {
          ...filter,
          choices: extractUniqueValues(data, filter.field)
        };
      }
      return filter;
    });
  }, [filters, data]);

  return (
    <div className="grid__filters">
      <Filters direction="row">
        {processedFilters.map(filter => (
          <Filter
            key={filter.field}
            filter={filter}
            value={values[filter.field]}
            onChange={(value) => onChange(prev => ({ 
              ...prev, 
              [filter.field]: value 
            }))}
          />
        ))}
      </Filters>
    </div>
  );
};