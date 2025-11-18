import { useState } from '@wordpress/element';
import Modal from '../Dialog';
import '../dialog.css';

/**
 * ListView Component
 * Displays collection data in a simple list format
 */
const ListView = ({
  data = [],
  loading = false,
  onView,
  selectedRecord: externalSelectedRecord,
  onCloseView,
  singleViewComponent: SingleViewComponent,
}) => {
  const [internalSelectedRecord, setInternalSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use external or internal state
  const selectedRecord = externalSelectedRecord !== undefined ? externalSelectedRecord : internalSelectedRecord;
  const isViewOpen = externalSelectedRecord !== undefined ? !!externalSelectedRecord : isModalOpen;

  const handleViewRecord = (record) => {
    if (onView) {
      // Let parent handle navigation (e.g., router)
      onView(record);
    } else {
      // Use internal modal
      setInternalSelectedRecord(record);
      setIsModalOpen(true);
    }
  };

  const handleCloseView = () => {
    if (onCloseView) {
      onCloseView();
    } else {
      setInternalSelectedRecord(null);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="list-view__state list-view__state--loading">
        <div className="list-view__message">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="list-view__state list-view__state--empty">
        <div className="list-view__message">No data available</div>
      </div>
    );
  }

  return (
    <div className="list-view">
      <div className="list-view__container">
        {data.map((record) => (
          <div
            key={record.id}
            className="list-view__item"
            onClick={() => handleViewRecord(record)}
          >
            <div className="list-view__item-content">
              <div className="list-view__item-title">
                {record.title || record.name || `Record ${record.id}`}
              </div>
              {record.description && (
                <div className="list-view__item-description">
                  {record.description}
                </div>
              )}
              <div className="list-view__item-meta">
                ID: {record.id}
              </div>
            </div>
            <div className="list-view__item-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRecord(record);
                }}
                className="grid__btn grid__btn--view"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="list-view__footer">
        {data.length} record(s)
      </div>

      {/* View Record Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={handleCloseView}
        title="Record Details"
      >
        {SingleViewComponent ? <SingleViewComponent record={selectedRecord} /> : null}
      </Modal>
    </div>
  );
};

export default ListView;
