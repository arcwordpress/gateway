import { __ } from '@wordpress/i18n';

const VIEW_CONFIGS = {
  table: {
    label: __('Table', 'gateway'),
    icon: '☰'
  },
  board: {
    label: __('Board', 'gateway'),
    icon: '▦'
  }
};

const ViewSwitcher = ({ currentView, onViewChange, enabledViews = ['table', 'board'] }) => {
  // If enabledViews is false or empty, don't render
  if (!enabledViews || enabledViews.length === 0) {
    return null;
  }

  // If only one view is enabled, don't show switcher
  if (enabledViews.length === 1) {
    return null;
  }

  return (
    <div className="gateway-view-switcher" style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px'
    }}>
      {enabledViews.map(viewType => {
        const config = VIEW_CONFIGS[viewType];
        if (!config) return null;

        return (
          <button
            key={viewType}
            onClick={() => onViewChange(viewType)}
            disabled={currentView === viewType}
            className={`view-switch-button ${currentView === viewType ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: currentView === viewType ? 'default' : 'pointer',
              backgroundColor: currentView === viewType ? '#2271b1' : 'white',
              color: currentView === viewType ? 'white' : '#2271b1',
              fontWeight: currentView === viewType ? 'bold' : 'normal'
            }}
          >
            <span style={{ marginRight: '0.25rem' }}>{config.icon}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;