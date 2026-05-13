import { Navigate } from 'react-router-dom';

/**
 * Generate routes configuration
 * @param {Object} props - Route configuration props
 * @param {string} props.viewKey - View identifier
 * @param {string} props.collectionKey - Collection identifier (derived from view)
 * @param {Array|null} props.viewColumns - Column definitions from the view
 * @param {boolean} props.showFilters - Whether to show filters
 * @param {Object} props.externalFilters - External filter values
 * @param {Array} props.enabledViews - Array of enabled view types
 * @param {Function} props.ViewGrid - ViewGrid component
 * @returns {Array} Array of route configurations
 */
export const generateRoutes = ({
  viewKey,
  collectionKey,
  viewColumns,
  showFilters,
  externalFilters,
  enabledViews,
  ViewGrid,
}) => {
  const sharedProps = {
    collectionKey,
    viewColumns,
    showFilters,
    externalFilters,
    enabledViews,
  };

  return [
    {
      path: '/:viewType/:recordId',
      element: <ViewGrid {...sharedProps} />,
    },
    {
      path: '/:viewType',
      element: <ViewGrid {...sharedProps} />,
    },
    {
      path: '/',
      element: <Navigate to={`/${enabledViews[0]}`} replace />,
    },
  ];
};

/**
 * Normalize enabledViews prop
 * @param {boolean|Array} enabledViews - Views configuration
 * @returns {Array} Normalized array of view types
 */
export const normalizeViews = (enabledViews) => {
  if (enabledViews === true) {
    return ['table', 'calendar', 'gallery'];
  }
  if (enabledViews === false) {
    return ['table'];
  }
  if (Array.isArray(enabledViews)) {
    return enabledViews;
  }
  return ['table'];
};

/**
 * Navigation helper functions
 */
export const navigationHelpers = {
  /**
   * Navigate to a different view type
   * @param {Function} navigate - React Router navigate function
   * @param {string} viewType - View type to navigate to
   */
  changeView: (navigate, viewType) => {
    navigate(`/${viewType}`);
  },

  /**
   * Navigate to view a single record
   * @param {Function} navigate - React Router navigate function
   * @param {string} viewType - Current view type
   * @param {Object} record - Record to view
   */
  viewRecord: (navigate, viewType, record) => {
    navigate(`/${viewType}/${record.id}`, { state: { record } });
  },

  /**
   * Close modal and return to grid view
   * @param {Function} navigate - React Router navigate function
   * @param {string} viewType - Current view type
   */
  closeModal: (navigate, viewType) => {
    navigate(`/${viewType}`);
  },
};