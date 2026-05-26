import { useState } from 'react';
import Modal from '../Dialog';
import { useGridContext } from '../../context/GridContext';
import { getLabelField } from '../../services/columnGenerator';
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
  const { collection } = useGridContext();
  const { fieldKey: labelKey, status: labelStatus } = getLabelField(collection);

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
        <div className="cards-view__message">No records available.</div>
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
              <span className="grid__id-badge">#{record.id}</span>
              <div className="cards-view__card-title">
                {labelStatus === 'none'
                  ? <span className="grid__no-label">No default label field set for this collection.</span>
                  : (record[labelKey] || <span className="grid__no-label grid__no-label--empty">—</span>)
                }
              </div>
            </div>
            <div className="cards-view__card-body">
              {record.description && (
                <div className="cards-view__card-description">
                  {record.description}
                </div>
              )}
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
