/**
 * Filters Component
 * Layout container for filter components with configurable direction (row/stack)
 */
const Filters = ({ children, direction = 'row', className = '' }) => {
  const baseClasses = 'flex gap-4';
  const directionClasses = {
    row: 'flex-row items-center',
    stack: 'flex-col items-start',
  };

  const combinedClasses = `${baseClasses} ${directionClasses[direction] || directionClasses.row} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default Filters;
