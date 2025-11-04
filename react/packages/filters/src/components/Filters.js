import './filter-group-style.css';

/**
 * FilterGroup Component
 * Layout container for filter components with configurable direction (row/stack)
 */
const FilterGroup = ({ children, direction = 'row', className = '' }) => {
  const baseClass = 'filters';
  const directionClasses = {
    row: 'filters--row',
    stack: 'filters--stack',
  };

  const combinedClasses = [
    baseClass,
    directionClasses[direction] || directionClasses.row,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

const Filters = FilterGroup;

export { FilterGroup, Filters };
export default FilterGroup;
