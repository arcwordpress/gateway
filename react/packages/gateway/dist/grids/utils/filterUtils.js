// src/utils/filterUtils.js
export var applyFilters = (data, filters, filterValues) => {
  if (!Array.isArray(data)) return [];
  if (!Array.isArray(filters) || filters.length === 0) return data;
  return data.filter(row => {
    return filters.every(filter => {
      var value = filterValues[filter.field];
      if (!value || typeof value === 'object' && Object.values(value).every(v => !v)) {
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
var applyTextFilter = (row, field, value) => {
  var cellValue = String(row[field] || '').toLowerCase();
  return cellValue.includes(value.toLowerCase());
};
var applySelectFilter = (row, field, value) => {
  return row[field] === value;
};
var applyDateRangeFilter = (row, field, _ref) => {
  var start = _ref.start,
    end = _ref.end;
  var cellValue = row[field];
  if (!cellValue) return false;
  var cellDate = new Date(cellValue);
  if (isNaN(cellDate.getTime())) return false;
  if (start) {
    var startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    if (cellDate < startDate) return false;
  }
  if (end) {
    var endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    if (cellDate > endDate) return false;
  }
  return true;
};
var applyRangeFilter = (row, field, _ref2) => {
  var min = _ref2.min,
    max = _ref2.max;
  var cellValue = Number(row[field]);
  if (isNaN(cellValue)) return false;
  if (min !== '' && cellValue < Number(min)) return false;
  if (max !== '' && cellValue > Number(max)) return false;
  return true;
};

/**
 * Extract unique values from data for a given field
 * Used to generate dynamic select filter choices
 */
export var extractUniqueValues = (data, field) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  var uniqueValues = new Set();
  data.forEach(row => {
    var value = row[field];
    if (value !== null && value !== undefined && value !== '') {
      uniqueValues.add(value);
    }
  });
  return Array.from(uniqueValues).map(value => ({
    value: value,
    label: String(value)
  }));
};