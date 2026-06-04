import { useCardsContext } from '../../context/CardsContext';

const CardsCardFooter = ({ record }) => {
  const { handleViewRecord } = useCardsContext();

  return (
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
  );
};

export default CardsCardFooter;
