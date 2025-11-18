import { useState } from '@wordpress/element';
import Modal from '../Dialog';
import '../dialog.css';

/**
 * CardsView Component
 * Displays collection data in a grid of cards
 */
const CardsView = ({
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
      <div className="cards-view__state cards-view__state--loading">
        <div className="cards-view__message">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="cards-view__state cards-view__state--empty">
        <div className="cards-view__message">No data available</div>
      </div>
    );
  }

  return (
    <div className="cards-view">
      <div className="cards-view__grid">
        {data.map((record) => (
          <div
            key={record.id}
            className="cards-view__card"
            onClick={() => handleViewRecord(record)}
          >
            <div className="cards-view__card-header">
              <div className="cards-view__card-title">
                {record.title || record.name || `Record ${record.id}`}
              </div>
            </div>
            <div className="cards-view__card-body">
              {record.description && (
                <div className="cards-view__card-description">
                  {record.description}
                </div>
              )}
              <div className="cards-view__card-meta">
                <span className="cards-view__card-meta-item">
                  ID: {record.id}
                </span>
              </div>
            </div>
            <div className="cards-view__card-footer">
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

      <div className="cards-view__footer">
        {data.length} card(s)
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

export default CardsView;
