// src/utils/filterUtils.js
export const applyFilters = (data, filters, filterValues) => {
  return data.filter(row => {
    return filters.every(filter => {
      const value = filterValues[filter.field];
      if (!value || (typeof value === 'object' && Object.values(value).every(v => !v))) {
        return true; // No filter applied
      }

      switch (filter.type) {
        case 'text':
          return applyTextFilter(row, filter.field, value);
        case 'select':
          return applySelectFilter(row, filter.field, value);
        case 'date_range':
          return applyDateRangeFilter(row, filter.field, value);
        case 'range':
          return applyRangeFilter(row, filter.field, value);
        default:
          return true;
      }
    });
  });
};

const applyTextFilter = (row, field, value) => {
  const cellValue = String(row[field] || '').toLowerCase();
  return cellValue.includes(value.toLowerCase());
};

const applySelectFilter = (row, field, value) => {
  return row[field] === value;
};

const applyDateRangeFilter = (row, field, { start, end }) => {
  const cellValue = row[field];
  if (!cellValue) return false;
  
  const cellDate = new Date(cellValue);
  if (isNaN(cellDate.getTime())) return false;

  if (start) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    if (cellDate < startDate) return false;
  }

  if (end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    if (cellDate > endDate) return false;
  }

  return true;
};

const applyRangeFilter = (row, field, { min, max }) => {
  const cellValue = Number(row[field]);
  if (isNaN(cellValue)) return false;
  
  if (min !== '' && cellValue < Number(min)) return false;
  if (max !== '' && cellValue > Number(max)) return false;
  
  return true;
};