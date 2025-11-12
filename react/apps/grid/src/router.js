import { Navigate } from 'react-router-dom';

/**
 * Generate routes configuration
 * @param {Object} props - Route configuration props
 * @param {string} props.collectionKey - Collection identifier
 * @param {boolean} props.showFilters - Whether to show filters
 * @param {Object} props.externalFilters - External filter values
 * @param {Array} props.enabledViews - Array of enabled view types
 * @param {Function} props.GridView - GridView component
 * @returns {Array} Array of route configurations
 */
export const generateRoutes = ({ 
  collectionKey, 
  showFilters, 
  externalFilters, 
  enabledViews, 
  GridView 
}) => {
  const sharedProps = {
    collectionKey,
    showFilters,
    externalFilters,
    enabledViews,
  };

  return [
    {
      path: '/:viewType/:recordId',
      element: <GridView {...sharedProps} />,
    },
    {
      path: '/:viewType',
      element: <GridView {...sharedProps} />,
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
    return ['table', 'board', 'calendar', 'gallery'];
  }
  if (enabledViews === false) {
    return ['table'];
  }
  if (Array.isArray(enabledViews)) {
    return enabledViews;
  }
  return ['table', 'board'];
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