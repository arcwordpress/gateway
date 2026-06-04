import { useCardsContext } from '../../context/CardsContext';
import CardsCardHeader from './CardsCardHeader';
import CardsCardBody from './CardsCardBody';
import CardsCardFooter from './CardsCardFooter';

/**
 * CardsCard — individual card shell.
 *
 * Without children renders the default header + body + footer.
 * Pass children to compose a fully custom card layout:
 *
 *   <CardsView.Card record={record}>
 *     <CardsView.CardHeader record={record} />
 *     <p>{record.custom_field}</p>
 *     <CardsView.CardFooter record={record} />
 *   </CardsView.Card>
 */
const CardsCard = ({ record, children, onClick }) => {
  const { handleViewRecord } = useCardsContext();

  return (
    <div
      className="cards-view__card"
      onClick={() => onClick ? onClick(record) : handleViewRecord(record)}
    >
      {children ?? (
        <>
          <CardsCardHeader record={record} />
          <CardsCardBody record={record} />
          <CardsCardFooter record={record} />
        </>
      )}
    </div>
  );
};

export default CardsCard;
