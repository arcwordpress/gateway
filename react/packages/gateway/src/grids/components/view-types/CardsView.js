import { useState } from 'react';
import CardsContext from '../../context/CardsContext';
import { useGridContext } from '../../context/GridContext';
import { getLabelField } from '../../services/columnGenerator';
import CardsGrid from './CardsGrid';
import CardsCard from './CardsCard';
import CardsCardHeader from './CardsCardHeader';
import CardsCardBody from './CardsCardBody';
import CardsCardFooter from './CardsCardFooter';
import CardsFooter from './CardsFooter';
import Modal from '../Dialog';
import '../dialog.css';

/**
 * CardsView — compound component.
 *
 * Without children renders everything (grid + footer + detail modal).
 * Pass children to control exactly what renders:
 *
 *   <CardsView data={data}>
 *     <CardsView.Grid>
 *       {(record) => (
 *         <CardsView.Card record={record}>
 *           <CardsView.CardHeader record={record} />
 *           <p>{record.custom_field}</p>
 *           <CardsView.CardFooter record={record} />
 *         </CardsView.Card>
 *       )}
 *     </CardsView.Grid>
 *     <CardsView.Footer />
 *   </CardsView>
 */
const CardsView = ({
  data = [],
  loading = false,
  onView,
  selectedRecord: externalSelectedRecord,
  onCloseView,
  singleViewComponent: SingleViewComponent,
  children,
}) => {
  const [internalSelectedRecord, setInternalSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { collection } = useGridContext();
  const { fieldKey: labelKey, status: labelStatus } = getLabelField(collection);

  const selectedRecord = externalSelectedRecord !== undefined ? externalSelectedRecord : internalSelectedRecord;
  const isViewOpen = externalSelectedRecord !== undefined ? !!externalSelectedRecord : isModalOpen;

  const handleViewRecord = (record) => {
    if (onView) {
      onView(record);
    } else {
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

  const contextValue = {
    data,
    collection,
    labelKey,
    labelStatus,
    selectedRecord,
    isViewOpen,
    handleViewRecord,
    handleCloseView,
    SingleViewComponent,
  };

  return (
    <CardsContext.Provider value={contextValue}>
      <div className="cards-view">
        {children ?? (
          <>
            <CardsGrid />
            <CardsFooter />
          </>
        )}
        <Modal isOpen={isViewOpen} onClose={handleCloseView} title="Record Details">
          {SingleViewComponent ? <SingleViewComponent record={selectedRecord} /> : null}
        </Modal>
      </div>
    </CardsContext.Provider>
  );
};

CardsView.Grid = CardsGrid;
CardsView.Card = CardsCard;
CardsView.CardHeader = CardsCardHeader;
CardsView.CardBody = CardsCardBody;
CardsView.CardFooter = CardsCardFooter;
CardsView.Footer = CardsFooter;

export default CardsView;
